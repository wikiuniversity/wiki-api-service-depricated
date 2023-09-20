import {RequestHandler} from "../util/requesthandler";
import {FileChecker, StringChecker} from "../util/checker";
import UserController from "./user";
import express from "express";
import {
    GetUserQuery,
    PostSignInQuery,
    PostSignUpQuery, PutAboutQuery, PutBdayQuery,
    PutFacultyQuery,
    PutFnameQuery,
    PutLnameQuery,
    PutPhotoQuery, PutSexQuery,
    PutUniversityQuery,
    PutEmailQuery
} from "./query";
import {
    CommonResponse,
    GetUserResponse,
    PostUserResponse,
    PutUserResponse,
    SignInResponse,
    SignUpResponse,
    SignUpValueErrorResponse
} from "../../../../shared/response";
import bcrypt from "bcrypt";
import {copyFileSync, unlink} from "fs";
import config from "../../util/conf/data-manage-config.json";
import authConf from "../../util/conf/auth-config.json"
import jwt from "jsonwebtoken";
import {BadRequestError, ValueError} from "../util/errors";
import {AuthRequest, verifyJWT} from "../../auth/auth";


// TODO: replace with actual type returned by mongoose
interface iUser {
    id: any,
    login: String,
    password: String,
    firstName: String,
    lastName: String
}

const _createToken = function (user: iUser) {  // TODO: replace with type returned by mongo
    const payload = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName
    }

    return jwt.sign(
        payload,
        authConf.TOKEN_SECRET
    )
}

class SignUpValueError extends ValueError {
    constructor(msg: 'existing-login' | 'existing-password') {
        super(msg);
        Object.setPrototypeOf(this, SignUpValueError.prototype)
    }

    public describe() {
        return {
            status: 'value-error',
            message: this.message
        } as SignUpValueErrorResponse
    }
}

class UserBaseHandler extends RequestHandler {
    protected controller_: UserController

    constructor(controller: UserController) {
        super();
        this.controller_ = controller
    }
}

export class GetBookmarksHandler extends UserBaseHandler {

    async handle(req: express.Request, res: express.Response) {
        let query = this.parseQuery<GetUserQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'}
        ])

        let id = query.params.id

        const user = await this.controller_.mongoHandler.findUserById(id)
        if (!user) {
            throw new ValueError("no-such-user")
        }
        res.status(200).send({
            status: 'ok',
            value: user.bookmarks
        } as GetUserResponse)
    }
}

export class PostSignUpHandler extends UserBaseHandler {

    async handle(req: express.Request, res: express.Response) {
        let query = this.parseQuery<PostSignUpQuery>(req, [
            {name: 'password', checker: StringChecker.necessary, type: 'query'},
            {name: 'login', checker: StringChecker.necessary, type: 'query'},
            {name: 'email', checker: StringChecker.necessary, type: 'query'},
            {name: 'org_name', checker: StringChecker.nullable, type: 'query'},
            {name: 'firstName', checker: StringChecker.nullable, type: 'query'},
            {name: 'lastName', checker: StringChecker.nullable, type: 'query'},
            {name: 'file', checker: FileChecker.nullable, type: 'query'},
            {name: 'about', checker: StringChecker.nullable, type: 'query'},
            {name: 'city', checker: StringChecker.nullable, type: 'query'}
        ])

        const token = await this.uploadNewUser(query)
        res.status(200).send({
            status: 'ok',
            value: token
        } as SignUpResponse)
    }

    private async uploadNewUser(query: PostSignUpQuery) {
        const pwd = query.query.password
        const login = query.query.login
        const email = query.query.email

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(pwd, salt)

        const existingUserLogin = await this.controller_.mongoHandler.findUserByNickname(login)
        if (existingUserLogin) {
            throw new SignUpValueError('existing-login')
        }


        let org_id = null
        if (query.query.orgName) {
            let org = await this.controller_.mongoHandler.findOrganizationByName(query.query.orgName)
            org_id = org?.id
        }

        let photo_path = null
        if (query.query.file) {
            photo_path = query.query.file.path
        }

        let about_value = null
        if (query.query.about) {
            about_value = query.query.about
        }

        let city_value = null
        if (query.query.city) {
            city_value = query.query.city
        }


        let savedUser = await this.controller_.mongoHandler.insertUser(
            login,
            hashPassword,
            email,
            org_id,
            query.query.firstName,
            query.query.lastName,
            about_value,
            city_value,
            'user',
            photo_path
        )

        if (photo_path) {
            let newPath = config.photoPath + savedUser.id
            // @ts-ignore
            copyFileSync(savedUser.photo, newPath)
            // @ts-ignore
            unlink(savedUser.photo, function () {
            })
        }

        // TODO: replace with type returned by mongo
        // @ts-ignore
        return _createToken(savedUser)
    }


}

export class PostSignInHandler extends UserBaseHandler {

    async handle(req: express.Request, res: express.Response) {

        let query = this.parseQuery<PostSignInQuery>(req, [
            {name: 'password', checker: StringChecker.necessary, type: 'query'},
            {name: 'login', checker: StringChecker.necessary, type: 'query'},
        ])

        const pwd = query.query.password
        const login = query.query.login

        let user = await this.controller_.mongoHandler.findUserByNickname(login)

        if (user === null || user === undefined) {
            // TODO: add a new error type
            throw new ValueError('wrong-login')
        }

        // @ts-ignore
        const isValid = await bcrypt.compare(pwd, user.password)
        if (!isValid) {
            // TODO: add a new error type
            throw new ValueError('wrong-password')
        }

        // TODO: replace with type returned by mongo
        // @ts-ignore
        const token = _createToken(user)
        res.status(200).send({
            status: 'ok',
            value: token
        } as SignInResponse)
    }
}

export class DeleteLogOutHandler extends UserBaseHandler {
    async handle(req: express.Request, res: express.Response) {
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: 'none',
            secure: true
        })

        res.status(200).send({
            status: 'ok'
        } as CommonResponse)
    }
}


export class ChangeRoleHandler extends UserBaseHandler {

    async handle(req: express.Request, res: express.Response, role: String) {
        let query = this.parseQuery<GetUserQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
        ])

        let id = query.params.id

        let usr = await this.controller_.mongoHandler.findUserById(id)
        // @ts-ignore
        await this._mongoHandler.changeRoleUserById(usr?.id, role)
        res.status(200).send({
            message: 'ok'
        } as PostUserResponse)
    }
}

export class GetPersonHandler extends UserBaseHandler {

    async handle(req: express.Request, res: express.Response) {
        let query = this.parseQuery<GetUserQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
        ])

        let id = query.params.id

        const usr = await this.controller_.mongoHandler.findUserById(id)
        res.status(200).send({
            status: 'ok',
            value: usr
        } as GetUserResponse)
    }
}


export class GetOrganizationHandler extends UserBaseHandler {

    async handle(req: express.Request, res: express.Response) {
        let query = this.parseQuery<GetUserQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
        ])

        let id = query.params.id

        const usr = await this.controller_.mongoHandler.findUserById(id)

        if (!usr) {
            // TODO: add a new error type
            throw new ValueError('no-such-user')
        }
        // TODO: what type of usr?
        // @ts-ignore
        const org = await this._mongoHandler.findOrganizationById(usr.organizationId)
        if (!org) {
            // TODO: add a new error type
            throw new ValueError('no-such-organization')
        }
        res.status(200).send(org)
    }
}

export class PutFnameHandler extends UserBaseHandler {

    async handle(req: express.Request, res: express.Response) {

        let query = this.parseQuery<PutFnameQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
            {name: 'firstName', checker: StringChecker.necessary, type: 'query'},
        ])

        let id = query.params.id

        let usr = await this.controller_.mongoHandler.findUserById(id)

        if (!usr) {
            // TODO: add a new error type
            throw new ValueError('no-such-user')
        }
        await this.controller_.mongoHandler.changeFirstNameUserById(usr?.id, query.query.firstName)
        res.status(200).send({
            status: 'ok'
        } as PutUserResponse)
    }
}

export class PutLnameHandler extends UserBaseHandler {

    async handle(req: express.Request, res: express.Response) {

        let query = this.parseQuery<PutLnameQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
            {name: 'lastName', checker: StringChecker.necessary, type: 'query'},
        ])

        let id = query.params.id

        let usr = await this.controller_.mongoHandler.findUserById(id)

        if (!usr) {
            // TODO: add a new error type
            throw new ValueError('no-such-user')
        }
        await this.controller_.mongoHandler.changeLastNameUserById(usr?.id, query.query.lastName)
        res.status(200).send({
            status: 'ok'
        } as PutUserResponse)
    }
}

export class PutEmailHandler extends UserBaseHandler {
    async handle(req: express.Request, res: express.Response) {
        let query = this.parseQuery<PutEmailQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
            {name: 'email', checker: StringChecker.necessary, type: 'query'},
        ])

        let id = query.params.id

        let usr = await this.controller_.mongoHandler.findUserById(id)

        if (!usr) {
            // TODO: add a new error type
            throw new ValueError('no-such-user')
        }
        await this.controller_.mongoHandler.changeEmailUserById(usr?.id, query.query.email)
        res.status(200).send({
            status: 'ok'
        } as PutUserResponse)
    }
}

export class PutPhotoHandler extends UserBaseHandler {
    async handle(req: express.Request, res: express.Response) {
        let query = this.parseQuery<PutPhotoQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
            {name: 'file', checker: FileChecker.instance, type: 'query'},
        ])

        let photo = query.query.file
        let path = photo?.path

        if (!path) {
            throw new BadRequestError('missing-photo')
        }

        let id = req.params.id

        let usr = await this.controller_.mongoHandler.findUserById(id)
        if (!usr) {
            // TODO: add a new error type
            throw new ValueError('no-such-user')
        }
        // @ts-ignore
        copyFileSync(path, usr.photo)
        res.status(200).send({
            status: 'ok'
        } as PutUserResponse)
    }
}

export class PutUniversityHandler extends UserBaseHandler {

    async handle(req: express.Request, res: express.Response) {
        let query = this.parseQuery<PutUniversityQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
            {name: 'file', checker: FileChecker.instance, type: 'query'},
        ])

        let id = query.params.id

        let usr = await this.controller_.mongoHandler.findUserById(id)

        if (!usr) {
            // TODO: add a new error type
            throw new ValueError('no-such-user')
        }

        await this.controller_.mongoHandler.changeUniversityUserById(usr?.id, query.query.orgId)
        res.status(200).send({
            status: 'ok'
        } as PutUserResponse)
    }
}

export class PutFacultyHandler extends UserBaseHandler {

    async handle(req: express.Request, res: express.Response) {
        let query = this.parseQuery<PutFacultyQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
            {name: 'file', checker: FileChecker.instance, type: 'query'},
        ])

        let id = query.params.id

        let usr = await this.controller_.mongoHandler.findUserById(id)

        if (!usr) {
            // TODO: add a new error type
            throw new ValueError('no-such-user')
        }
        await this.controller_.mongoHandler.changeFacultyUserById(usr?.id, query.query.faculty)
        res.status(200).send({
            status: 'ok'
        } as PutUserResponse)
    }
}

export class GetWhoAmIHandler extends UserBaseHandler {

    async handle(req: express.Request, res: express.Response) {
        const token = verifyJWT(req, res)

        if (! token) {
            return
        }

        const decodedToken = jwt.decode(token)

        if (!decodedToken) {
            throw new BadRequestError('invalid-token')
        }
        const userId = (decodedToken as jwt.JwtPayload).id

        const usr = await this.controller_.mongoHandler.findUserById(userId)

        if (!usr) {
            res.status(200).send({
                status: 'ok',
                value: null
            })
            return
        }

        const value = {
            email: usr.email,
            firstName: usr.firstName,
            lastName: usr.lastName,
            photo: usr.photo,
            organizationId: usr.organizationId,
            role: usr.role,
            id: usr.id,
            about: usr.about,
            nickname: usr.nickname,
            birthday: usr.birthday,
            sex: usr.sex,
            faculty: usr.faculty,
            documents: usr.documents,
            registered: usr.registered,
            city: usr.city,
            bookmarks: usr.bookmarks
        }

        res.status(200).send({
            status: 'ok',
            value: value
        } as GetUserResponse)
    }
}

export class PutAboutHandler extends UserBaseHandler {
    async handle(req: express.Request, res: express.Response) {
        let query = this.parseQuery<PutAboutQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
            {name: 'about', checker: StringChecker.necessary, type: 'query'},
        ])

        let id = query.params.id

        let usr = await this.controller_.mongoHandler.findUserById(id)

        if (!usr) {
            res.status(400).send({
                status: 'value-error',
                message: 'no-such-id'
            } as PutUserResponse)
            return
        }

        await this.controller_.mongoHandler.changeAboutUserById(usr._id, query.query.about)

        res.status(200).send({
            status: 'ok'
        } as PutUserResponse)
    }
}

export class PutSexHandler extends UserBaseHandler {
    async handle(req: express.Request, res: express.Response) {
        let query = this.parseQuery<PutSexQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
            {name: 'sex', checker: StringChecker.necessary, type: 'query'},
        ])

        let id = query.params.id

        let usr = await this.controller_.mongoHandler.findUserById(id)

        if (!usr) {
            res.status(400).send({
                status: 'value-error',
                message: 'no-such-id'
            } as PutUserResponse)
            return
        }

        await this.controller_.mongoHandler.changeSexUserById(usr._id, query.query.sex)

        res.status(200).send({
            status: 'ok'
        } as PutUserResponse)
    }
}

export class PutBdayHandler extends UserBaseHandler {
    async handle(req: express.Request, res: express.Response) {
        let query = this.parseQuery<PutBdayQuery>(req, [
            {name: 'id', checker: StringChecker.necessary, type: 'params'},
            {name: 'birthday', checker: StringChecker.necessary, type: 'query'},
        ])

        let id = query.params.id

        let usr = await this.controller_.mongoHandler.findUserById(id)

        if (!usr) {
            res.status(400).send({
                status: 'value-error',
                message: 'no-such-id'
            } as PutUserResponse)
            return
        }

        await this.controller_.mongoHandler.changeBdayUserById(usr._id, query.query.birthday)

        res.status(200).send({
            status: 'ok'
        } as PutUserResponse)
    }
}