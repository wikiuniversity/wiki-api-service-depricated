"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ml_handler_1 = __importDefault(require("./util/ml-handler"));
const document_1 = __importDefault(require("./controllers/document/document"));
const user_1 = __importDefault(require("./controllers/user/user"));
const mongo_handler_1 = __importDefault(require("./util/mongo-handler"));
const connection_config_json_1 = __importDefault(require("./util/conf/connection-config.json"));
const organization_1 = __importDefault(require("./controllers/organization/organization"));
const errors_1 = require("./controllers/util/errors");
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.mlService = new ml_handler_1.default(connection_config_json_1.default.mlServiceUrl);
        this.app.use((0, cors_1.default)());
        this.app.listen(connection_config_json_1.default.serverPort, () => console.log(`Server running on port ${connection_config_json_1.default.serverPort}`));
        this.addRoute("/document", new document_1.default(this));
        this.addRoute("/user", new user_1.default(this));
        this.addRoute("/organization", new organization_1.default(this));
        this.app.use((err, req, res, next) => {
            if (err instanceof errors_1.BadRequestError) {
                res.status(err.code).send(err.describe());
                return;
            }
            if (err instanceof errors_1.ValueError) {
                res.status(200).send(err.describe());
                return;
            }
            console.error(err.stack);
            if (err instanceof errors_1.DescriptiveErrorResponse) {
                res.status(500).send(err.describe());
                return;
            }
            res.status(500).send({
                status: "error",
                message: "Internal server error"
            });
        });
    }
    addRoute(url, route) {
        this.app.use(url, route.router);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("started\n");
            yield this.connectToMLService();
            console.log("started server\n");
            yield this.connectToMongo();
        });
    }
    connectToMLService() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: uncomment this when ML service is ready
            // await this.mlService.connect()
        });
    }
    connectToMongo() {
        return __awaiter(this, void 0, void 0, function* () {
            yield mongo_handler_1.default.getInstance().connect();
        });
    }
}
exports.Server = Server;
new Server().start().then();
//# sourceMappingURL=app.js.map