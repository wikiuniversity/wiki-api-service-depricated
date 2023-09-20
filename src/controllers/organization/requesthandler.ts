import {RequestHandler} from "../util/requesthandler";
import UserController from "../user/user";
import OrganizationController from "./organization";
import express from "express";
import {GetUserQuery} from "../user/query";
import {ArrayStringChecker, BooleanChecker, StringChecker} from "../util/checker";
import {BadRequestResponse, GetUserResponse, OkResponse, ServerErrorResponse} from "../../../../shared/response";
import {PostRegisterQuery} from "./query";
import {ValueError} from "../util/errors";

class OrganizationBaseHandler extends RequestHandler {
    protected controller_: OrganizationController

    constructor(controller: OrganizationController) {
        super();
        this.controller_ = controller
    }
}

export class PostRegisterHandler extends OrganizationBaseHandler {
    async handle(req: express.Request, res: express.Response) {
        let query = this.parseQuery<PostRegisterQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
            {name: 'respFname', checker: StringChecker.necessary, type: 'query'},
            {name: 'respLname', checker: StringChecker.necessary, type: 'query'},
            {name: 'name', checker: StringChecker.necessary, type: 'query'},
            {name: 'location', checker: StringChecker.necessary, type: 'query'},
            {name: 'isMember', checker: BooleanChecker.instance, type: 'query'},
            {name: 'admins', checker: ArrayStringChecker.instance, type: 'query'},
        ])

        let responsible = await this.controller_
            .mongoHandler
            .findUserByName(query.query.respFname, query.query.respLname)

        if (responsible === null) {
            throw new ValueError("no-such-responsible-filed")
        }

        await this.controller_.mongoHandler.insertOrganization(
            query.query.name,
            query.query.location,
            query.query.isMember,
            responsible.id,
            query.query.admins
        )
        res.status(200).send({
            status: 'ok'
        } as OkResponse)
    }
}