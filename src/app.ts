import express, {Express} from "express"
import cors from "cors"
import MlHandler from "./util/ml-handler";
import Controller from "./controllers/controller";
import DocumentController from "./controllers/document/document";
import UserController from "./controllers/user/user";
import MongoHandler from "./util/mongo-handler";
import config from "./util/conf/connection-config.json"
import OrganizationController from "./controllers/organization/organization";
import {BadRequestError, DescriptiveErrorResponse, ValueError} from "./controllers/util/errors";

export class Server {
    mlService: MlHandler
    app: Express = express()

    constructor() {
        this.mlService = new MlHandler(config.mlServiceUrl)
        this.app.use(cors())

        this.app.listen(config.serverPort, () =>
            console.log(`Server running on port ${config.serverPort}`)
        )

        this.addRoute("/document", new DocumentController(this));
        this.addRoute("/user", new UserController(this))
        this.addRoute("/organization", new OrganizationController(this))


        this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            if(err instanceof BadRequestError) {
                res.status(err.code).send(err.describe())
                return
            }

            if(err instanceof ValueError) {
                res.status(200).send(err.describe())
                return
            }

            console.error(err.stack)

            if(err instanceof DescriptiveErrorResponse) {
                res.status(500).send(err.describe())
                return
            }

            res.status(500).send({
                status: "error",
                message: "Internal server error"
            })
        })
    }

    private addRoute(url: string, route: Controller) {
        this.app.use(url, route.router)
    }

    async start() {
        console.log("started\n");
        await this.connectToMLService()
        console.log("started server\n");
        await this.connectToMongo()
    }

    async connectToMLService() {
        // TODO: uncomment this when ML service is ready
        // await this.mlService.connect()
    }

    async connectToMongo() {
        await MongoHandler.getInstance().connect()
    }
}

new Server().start().then()
