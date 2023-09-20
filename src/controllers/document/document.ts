import {Request, Response, Router} from 'express'
import multer, {StorageEngine} from 'multer'
import config from "../../util/conf/data-manage-config.json"
import {Server} from '../../app'
import Mongo from '../../model/mongo'
import {
    GetDocumentHandler,
    GetDocumentRateHandler,
    GetProcessedDocumentHandler,
    GetRelevantDocsHandler,
    PostNewDocumentHandler,
    PutRateHandler
} from "./requesthandler";
import asyncHandler from "express-async-handler";


// Controller for /doc/:id/
export default class DocumentController {
    router = Router()
    private multer: multer.Multer;
    private server: Server;

    private storage: StorageEngine;

    private _mongoHandler: Mongo;

    constructor(server: Server) {
        this.server = server
        this.storage = multer.diskStorage({
            destination: function (req, file, cb) {
                // cb(null, '/content/load_lobby')
                cb(null, config.fileLobbyPath)
            },
            filename: function (req, file, cb) {
                cb(null, file.fieldname + '-' + Date.now())
            }
        })

        this.multer = multer({ storage: this.storage })
        this.router.get('/:id/info/description', asyncHandler(this.getDocumentInfo.bind(this)))
        this.router.get('/:id/info/rate', asyncHandler(this.getDocumentRate.bind(this)))
        this.router.get('/:id/info/relevant', asyncHandler(this.getRelevantDocs.bind(this)))
        this.router.get('/:id/layout', asyncHandler(this.getProcessedDocument.bind(this)))
        this.router.put('/:id/set_rate', asyncHandler(this.putRate.bind(this)))
        this.router.get('/:id/registry', asyncHandler(this.getRegistry.bind(this)))
        this.router.post('/upload', this.multer.single("file"), asyncHandler(this.postNewDocument.bind(this)))

        this._mongoHandler = Mongo.getInstance()

    }

    private async getDocumentInfo(req: Request, res: Response) {
        await new GetDocumentHandler(this).handle(req, res)
    }

    get mongoHandler(): Mongo {
        return this._mongoHandler;
    }

    private async getDocumentRate(req: Request, res: Response) {
        await new GetDocumentRateHandler(this).handle(req, res)
     }

    private async getRelevantDocs(req: Request, res: Response) {
        /**
         * Returns documents with same content
         */
        await new GetRelevantDocsHandler(this).handle(req, res)
    }

    private async getProcessedDocument(req: Request, res: Response) {
        /**
         * Returns processed .md file
         */
        await new GetProcessedDocumentHandler(this).handle(req, res)
    }

    private async postNewDocument(req: Request, res: Response) {
        /**
         * Upload new document by authorized not banned user
         */
        await new PostNewDocumentHandler(this).handle(req, res)
    }



    private async putRate(req: Request, res: Response) {
        /**
         * Update document rate
         */
        await new PutRateHandler(this).handle(req, res)
    }

    private getRegistry(req: Request, res: Response) {
        /**
         * Returns many documents with specific selection
         */
        let id = req.params.id

    }



}