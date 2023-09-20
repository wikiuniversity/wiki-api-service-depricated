import {Request, response, Response, Router} from 'express'
import {Server} from "../../app";
import Mongo from "../../model/mongo";
import {PostRegisterHandler} from "./requesthandler";
import asyncHandler from "express-async-handler";


export default class OrganizationController {
    get mongoHandler(): Mongo {
        return this._mongoHandler;
    }
    router = Router()
    private server: Server
    private _mongoHandler: Mongo
    constructor(server: Server) {
        this.server = server
        this._mongoHandler = Mongo.getInstance()
        this.router.post('/register', asyncHandler(this.postRegister.bind(this)))
    }

    private async postRegister(req: Request, res: Response) {
        await new PostRegisterHandler(this).handle(req, res)
    }
}