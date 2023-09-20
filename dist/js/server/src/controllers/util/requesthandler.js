"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestHandler = void 0;
class RequestHandler {
    parseQuery(req, fields) {
        let query = { params: {}, query: {} };
        for (let field of fields) {
            if (field.type === 'query') {
                query[field.type][field.name] = field.checker.check(field.name, req.query[field.name]);
            }
            else if (field.type === 'params') {
                query[field.type][field.name] = field.checker.check(field.name, req.params[field.name]);
            }
        }
        return query;
    }
}
exports.RequestHandler = RequestHandler;
//# sourceMappingURL=requesthandler.js.map