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
const mongo_1 = __importDefault(require("../../model/mongo"));
const requesthandler_1 = require("./requesthandler");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
class OrganizationController {
    get mongoHandler() {
        return this._mongoHandler;
    }
    constructor(server) {
        this.router = (0, express_1.Router)();
        this.server = server;
        this._mongoHandler = mongo_1.default.getInstance();
        this.router.post('/register', (0, express_async_handler_1.default)(this.postRegister.bind(this)));
    }
    postRegister(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new requesthandler_1.PostRegisterHandler(this).handle(req, res);
        });
    }
}
exports.default = OrganizationController;
//# sourceMappingURL=organization.js.map