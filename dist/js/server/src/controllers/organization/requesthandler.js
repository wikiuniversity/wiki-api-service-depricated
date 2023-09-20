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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRegisterHandler = void 0;
const requesthandler_1 = require("../util/requesthandler");
const checker_1 = require("../util/checker");
const errors_1 = require("../util/errors");
class OrganizationBaseHandler extends requesthandler_1.RequestHandler {
    constructor(controller) {
        super();
        this.controller_ = controller;
    }
}
class PostRegisterHandler extends OrganizationBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
                { name: 'respFname', checker: checker_1.StringChecker.necessary, type: 'query' },
                { name: 'respLname', checker: checker_1.StringChecker.necessary, type: 'query' },
                { name: 'name', checker: checker_1.StringChecker.necessary, type: 'query' },
                { name: 'location', checker: checker_1.StringChecker.necessary, type: 'query' },
                { name: 'isMember', checker: checker_1.BooleanChecker.instance, type: 'query' },
                { name: 'admins', checker: checker_1.ArrayStringChecker.instance, type: 'query' },
            ]);
            let responsible = yield this.controller_
                .mongoHandler
                .findUserByName(query.query.respFname, query.query.respLname);
            if (responsible === null) {
                throw new errors_1.ValueError("no-such-responsible-filed");
            }
            yield this.controller_.mongoHandler.insertOrganization(query.query.name, query.query.location, query.query.isMember, responsible.id, query.query.admins);
            res.status(200).send({
                status: 'ok'
            });
        });
    }
}
exports.PostRegisterHandler = PostRegisterHandler;
//# sourceMappingURL=requesthandler.js.map