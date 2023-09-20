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
exports.PutRateHandler = exports.PostNewDocumentHandler = exports.GetProcessedDocumentHandler = exports.GetRelevantDocsHandler = exports.GetDocumentRateHandler = exports.GetDocumentHandler = void 0;
const requesthandler_1 = require("../util/requesthandler");
const data_manage_config_json_1 = __importDefault(require("../../util/conf/data-manage-config.json"));
const checker_1 = require("../util/checker");
const fs_1 = require("fs");
const console_1 = __importDefault(require("console"));
const errors_1 = require("../util/errors");
class DocumentBaseHandler extends requesthandler_1.RequestHandler {
    constructor(controller) {
        super();
        this.controller_ = controller;
    }
}
class GetDocumentHandler extends DocumentBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
            ]);
            let id = query.params.id;
            let doc = yield this.controller_.mongoHandler.findDocumentById(id);
            if (!doc) {
                throw new errors_1.ValueError("no-such-document");
            }
            res.status(200).send({
                status: 'ok',
                value: doc
            });
        });
    }
}
exports.GetDocumentHandler = GetDocumentHandler;
class GetDocumentRateHandler extends DocumentBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
            ]);
            let id = query.params.id;
            const doc = yield this.controller_.mongoHandler.findDocumentById(id);
            if (!doc) {
                throw new errors_1.ValueError("no-such-document");
            }
            res.status(200).send({
                status: 'ok',
                value: doc.rate
            });
        });
    }
}
exports.GetDocumentRateHandler = GetDocumentRateHandler;
class GetRelevantDocsHandler extends DocumentBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
            ]);
            let id = query.params.id;
            let relevant_ids = yield this.controller_.mongoHandler.findRelevantById(id);
            if (!relevant_ids) {
                throw new errors_1.ValueError("no-such-document");
            }
            let docs = [];
            for (const id1 of relevant_ids) {
                let doc = yield this.controller_.mongoHandler.findDocumentById(id1);
                if (doc) {
                    docs.push(doc);
                }
            }
            res.status(200).send({
                status: 'ok',
                value: relevant_ids
            });
        });
    }
}
exports.GetRelevantDocsHandler = GetRelevantDocsHandler;
class GetProcessedDocumentHandler extends DocumentBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: add GetProcessedDocumentQuery and use it instead of GetDocumentQuery here
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
            ]);
            let id = req.params.id;
            const doc = yield this.controller_.mongoHandler.findDocumentById(id);
            if (!doc) {
                // TODO: add a new error type
                throw new errors_1.ValueError("no-such-document");
            }
            if (!doc.content) {
                throw new errors_1.ValueError('no-such-document');
            }
            res.status(200).sendFile(doc.content);
            res.status(200).send({
                status: 'ok',
                value: doc.content
            });
        });
    }
}
exports.GetProcessedDocumentHandler = GetProcessedDocumentHandler;
class PostNewDocumentHandler extends DocumentBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
                { name: 'file', checker: checker_1.FileChecker.instance, type: 'query' },
                { name: 'theme', checker: checker_1.StringChecker.necessary, type: 'query' },
                { name: 'subtheme', checker: checker_1.StringChecker.necessary, type: 'query' },
                { name: 'author', checker: checker_1.StringChecker.necessary, type: 'query' },
                { name: 'org_name', checker: checker_1.StringChecker.necessary, type: 'query' },
            ]);
            let file = req.file;
            let path = file === null || file === void 0 ? void 0 : file.path;
            yield this.uploadNewDocument(query);
            // this.server.mlService.postRequest(path).then((result) => {
            //     res.send(result)
            // })
            res.status(200).send({
                status: 'ok'
            });
        });
    }
    uploadNewDocument(query) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Upload new document and toggle ml service to process
             */
            // @ts-ignore
            const org = yield this._mongoHandler.findOrganizationByName(req.query.org_name);
            let saved_doc = yield this.controller_.mongoHandler.insertDocument(query.query.file.filename, 
            // @ts-ignore
            query.query.theme, query.query.subtheme, query.query.author, org._id, query.query.file.path, query.query.tags);
            let new_path = data_manage_config_json_1.default.contentPath + saved_doc.id;
            // @ts-ignore
            (0, fs_1.copyFileSync)(saved_doc.content, new_path);
            // @ts-ignore
            (0, fs_1.unlink)(saved_doc.content, function () {
            });
            return this.controller_.mongoHandler.changeContentDocumentById(saved_doc.id, new_path).catch(err => console_1.default.error(err));
        });
    }
}
exports.PostNewDocumentHandler = PostNewDocumentHandler;
class PutRateHandler extends DocumentBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
            ]);
            let id = query.params.id;
            let score = parseInt(req.query.score);
            const registry = yield this.controller_.mongoHandler.updateRateDocumentById(id, score);
            // TODO: not doing anything with the registry?
            res.status(200).send({
                status: 'ok'
            });
        });
    }
}
exports.PutRateHandler = PutRateHandler;
//# sourceMappingURL=requesthandler.js.map