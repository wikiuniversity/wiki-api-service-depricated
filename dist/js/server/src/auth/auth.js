"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = exports.verifyJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_config_json_1 = __importDefault(require("../util/conf/auth-config.json"));
const verifyJWT = (req, res) => {
    const reqauth = req;
    const authHeader = reqauth.headers.authorization;
    if (!authHeader) {
        res.status(403).send({
            status: 'error',
            message: 'token-expected'
        });
        return;
    }
    const bearer = authHeader.split(' ');
    const bearerToken = bearer.at(0);
    if (!bearerToken) {
        res.status(403).send({
            status: 'error',
            message: 'token-expected'
        });
        return;
    }
    return bearerToken;
};
exports.verifyJWT = verifyJWT;
const authenticateJWT = (req, res, next) => {
    let bearerToken = (0, exports.verifyJWT)(req, res);
    if (!bearerToken) {
        return;
    }
    jsonwebtoken_1.default.verify(bearerToken, auth_config_json_1.default.TOKEN_SECRET, (err, data) => {
        if (err) {
            res.status(401).send({
                status: 'error',
                message: 'token-invalid: ' + err.message
            });
            return;
        }
        next();
    });
};
exports.authenticateJWT = authenticateJWT;
//# sourceMappingURL=auth.js.map