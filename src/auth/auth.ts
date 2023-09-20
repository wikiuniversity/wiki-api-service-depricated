import {NextFunction, Response, Request} from "express";
import {AuthResponse} from "../../../shared/response";
import jwt from "jsonwebtoken";
import authConf from "../util/conf/auth-config.json"

export interface AuthRequest extends Express.Request {
    headers: {authorization: string}
}

export const verifyJWT = (req: Request, res: Response) => {
    const reqauth = req as AuthRequest
    const authHeader = reqauth.headers.authorization;

    if (!authHeader) {
        res.status(403).send({
            status: 'error',
            message: 'token-expected'
        } as AuthResponse)
        return
    }

    const bearer = authHeader.split(' ');
    const bearerToken = bearer.at(0);

    if (!bearerToken) {
        res.status(403).send({
            status: 'error',
            message: 'token-expected'
        } as AuthResponse)
        return
    }
    return bearerToken
}
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    let bearerToken = verifyJWT(req, res)

    if (! bearerToken) {
        return
    }

    jwt.verify(bearerToken, authConf.TOKEN_SECRET, (err, data) => {
        if (err) {
            res.status(401).send({
                status: 'error',
                message: 'token-invalid: ' + err.message
            } as AuthResponse)
            return
        }
        next()
    })
}
