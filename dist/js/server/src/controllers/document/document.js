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
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const data_manage_config_json_1 = __importDefault(require("../../util/conf/data-manage-config.json"));
const mongo_1 = __importDefault(require("../../model/mongo"));
const requesthandler_1 = require("./requesthandler");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
// Controller for /doc/:id/
class DocumentController {
    constructor(server) {
        this.router = (0, express_1.Router)();
        this.server = server;
        this.storage = multer_1.default.diskStorage({
            destination: function (req, file, cb) {
                // cb(null, '/content/load_lobby')
                cb(null, data_manage_config_json_1.default.fileLobbyPath);
            },
            filename: function (req, file, cb) {
                cb(null, file.fieldname + '-' + Date.now());
            }
        });
        this.multer = (0, multer_1.default)({ storage: this.storage });
        this.router.get('/:id/info/description', (0, express_async_handler_1.default)(this.getDocumentInfo.bind(this)));
        this.router.get('/:id/info/rate', (0, express_async_handler_1.default)(this.getDocumentRate.bind(this)));
        this.router.get('/:id/info/relevant', (0, express_async_handler_1.default)(this.getRelevantDocs.bind(this)));
        this.router.get('/:id/layout', (0, express_async_handler_1.default)(this.getProcessedDocument.bind(this)));
        this.router.put('/:id/set_rate', (0, express_async_handler_1.default)(this.putRate.bind(this)));
        this.router.get('/:id/registry', (0, express_async_handler_1.default)(this.getRegistry.bind(this)));
        this.router.post('/upload', this.multer.single("file"), (0, express_async_handler_1.default)(this.postNewDocument.bind(this)));
        this._mongoHandler = mongo_1.default.getInstance();
    }
    getDocumentInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new requesthandler_1.GetDocumentHandler(this).handle(req, res);
        });
    }
    get mongoHandler() {
        return this._mongoHandler;
    }
    getDocumentRate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new requesthandler_1.GetDocumentRateHandler(this).handle(req, res);
        });
    }
    getRelevantDocs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Returns documents with same content
             */
            yield new requesthandler_1.GetRelevantDocsHandler(this).handle(req, res);
        });
    }
    getProcessedDocument(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Returns processed .md file
             */
            yield new requesthandler_1.GetProcessedDocumentHandler(this).handle(req, res);
        });
    }
    postNewDocument(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Upload new document by authorized not banned user
             */
            yield new requesthandler_1.PostNewDocumentHandler(this).handle(req, res);
        });
    }
    putRate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Update document rate
             */
            yield new requesthandler_1.PutRateHandler(this).handle(req, res);
        });
    }
    getRegistry(req, res) {
        /**
         * Returns many documents with specific selection
         */
        let id = req.params.id;
    }
}
exports.default = DocumentController;
//# sourceMappingURL=document.js.map