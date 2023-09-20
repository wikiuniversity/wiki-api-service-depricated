import {RequestHandler} from "../util/requesthandler";
import DocumentController from "./document";
import express from "express";
import config from "../../util/conf/data-manage-config.json"
import {FileChecker, StringChecker} from "../util/checker";
import {GetDocumentResponse, OkResponse, ServerErrorResponse} from "../../../../shared/response";
import {GetDocumentQuery, PostNewDocumentQuery} from "./query";
import {copyFileSync, unlink} from "fs";
import Console from "console";
import {ValueError} from "../util/errors";

class DocumentBaseHandler extends RequestHandler {
    protected controller_: DocumentController

    constructor(controller: DocumentController) {
        super();
        this.controller_ = controller
    }
}

export class GetDocumentHandler extends DocumentBaseHandler {
    async handle(req: express.Request, res: express.Response) {
        let query = this.parseQuery<GetDocumentQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
        ])

        let id = query.params.id

        let doc = await this.controller_.mongoHandler.findDocumentById(id)
        if(!doc) {
            throw new ValueError("no-such-document")
        }

        res.status(200).send({
            status: 'ok',
            value: doc
        } as GetDocumentResponse)
    }
}


export class GetDocumentRateHandler extends DocumentBaseHandler {
    async handle(req: express.Request, res: express.Response) {
        let query = this.parseQuery<GetDocumentQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
        ])

        let id = query.params.id

        const doc = await this.controller_.mongoHandler.findDocumentById(id)
        if (!doc) {
            throw new ValueError("no-such-document")
        }
        res.status(200).send({
            status: 'ok',
            value: doc.rate
        } as GetDocumentResponse)
    }
}

export class GetRelevantDocsHandler extends DocumentBaseHandler {
    async handle(req: express.Request, res: express.Response) {
        let query = this.parseQuery<GetDocumentQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
        ])

        let id = query.params.id
        let relevant_ids = await this.controller_.mongoHandler.findRelevantById(id)

        if (!relevant_ids) {
            throw new ValueError("no-such-document")
        }

        let docs = []
        for (const id1 of relevant_ids) {
            let doc = await this.controller_.mongoHandler.findDocumentById(id1)
            if(doc) {
                docs.push(doc)
            }
        }

        res.status(200).send({
            status: 'ok',
            value: relevant_ids
        } as GetDocumentResponse)
    }
}

export class GetProcessedDocumentHandler extends DocumentBaseHandler {
    async handle(req: express.Request, res: express.Response) {
        // TODO: add GetProcessedDocumentQuery and use it instead of GetDocumentQuery here
        let query = this.parseQuery<GetDocumentQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
        ])

        let id = req.params.id

        const doc = await this.controller_.mongoHandler.findDocumentById(id)
        if (!doc) {
            // TODO: add a new error type
            throw new ValueError("no-such-document")
        }

        if (!doc.content) {
            throw new ValueError('no-such-document')
        }

        res.status(200).sendFile(doc.content)

        res.status(200).send({
            status: 'ok',
            value: doc.content
        } as GetDocumentResponse)
    }
}

export class PostNewDocumentHandler extends DocumentBaseHandler {
    async handle(req: express.Request, res: express.Response) {
        let query = this.parseQuery<PostNewDocumentQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
            {name: 'file', checker: FileChecker.instance, type: 'query'},
            {name: 'theme', checker: StringChecker.necessary, type: 'query'},
            {name: 'subtheme', checker: StringChecker.necessary, type: 'query'},
            {name: 'author', checker: StringChecker.necessary, type: 'query'},
            {name: 'org_name', checker: StringChecker.necessary, type: 'query'},
        ])

        let file = req.file
        let path = file?.path

        await this.uploadNewDocument(query)

        // this.server.mlService.postRequest(path).then((result) => {
        //     res.send(result)
        // })
        res.status(200).send({
            status: 'ok'
        } as OkResponse)
    }

    private async uploadNewDocument(query: PostNewDocumentQuery) {
        /**
         * Upload new document and toggle ml service to process
         */

            // @ts-ignore
        const org = await this._mongoHandler.findOrganizationByName(req.query.org_name)

        let saved_doc = await this.controller_.mongoHandler.insertDocument(
            query.query.file.filename,
            // @ts-ignore
            query.query.theme,
            query.query.subtheme,
            query.query.author,
            org._id,
            query.query.file.path,
            query.query.tags
        )
        let new_path = config.contentPath + saved_doc.id
        // @ts-ignore
        copyFileSync(saved_doc.content, new_path)
        // @ts-ignore
        unlink(saved_doc.content, function () {
        })

        return this.controller_.mongoHandler.changeContentDocumentById(saved_doc.id, new_path).catch(err => Console.error(err))
    }
}

export class PutRateHandler extends DocumentBaseHandler {
    async handle(req: express.Request, res: express.Response) {
        let query = this.parseQuery<GetDocumentQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
        ])

        let id = query.params.id
        let score = parseInt(<string>req.query.score)

        const registry = await this.controller_.mongoHandler.updateRateDocumentById(id, score)
        // TODO: not doing anything with the registry?

        res.status(200).send({
            status: 'ok'
        } as OkResponse)
    }
}