import {Request, Response, Router} from 'express';
import {Server} from "../../app";
import Mongo from "../../model/mongo";
import multer, {StorageEngine} from 'multer'
import dataConfig from "../../util/conf/data-manage-config.json";
import {SignUpValueErrorResponse} from "../../../../shared/response";
import {authenticateJWT} from "../../auth/auth";
import {
    ChangeRoleHandler, DeleteLogOutHandler,
    GetBookmarksHandler,
    GetOrganizationHandler,
    GetPersonHandler, GetWhoAmIHandler,
    PostSignInHandler,
    PostSignUpHandler, PutAboutHandler, PutBdayHandler, PutEmailHandler,
    PutFacultyHandler,
    PutFnameHandler,
    PutLnameHandler,
    PutPhotoHandler, PutSexHandler,
    PutUniversityHandler
} from "./requesthandler";
import asyncHandler from "express-async-handler";


class RequestValueError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, RequestValueError.prototype)
    }
}

class DataError extends Error {
    constructor(msg: 'existing-login' | 'existing-password') {
        super(msg);
        Object.setPrototypeOf(this, RequestValueError.prototype)
    }

    public describe() {
        return {
            status: 'value-error',
            message: this.message
        } as SignUpValueErrorResponse
    }
}

export default class UserController {
    router: Router = Router()
    private server: Server
    private _mongoHandler: Mongo
    private multer: multer.Multer
    private storage: StorageEngine

    constructor(server: Server) {
        this.server = server
        this.storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, dataConfig.photoLobbyPath)
            },
            filename: function (req, file, cb) {
                cb(null, file.fieldname + '-' + Date.now())
            }
        })

        this.multer = multer({storage: this.storage})

        this.router.get('/:id/bookmarks', authenticateJWT, asyncHandler(this.getBookmarks.bind(this)))  // TODO: authenticate to all needed
        this.router.get('/guest/signup', this.multer.single('photo'), asyncHandler(this.postSignUp.bind(this)))
        this.router.get('/guest/signin', asyncHandler(this.postSignIn.bind(this)))
        this.router.post('/:id/role/admin', asyncHandler(this.postAdmin.bind(this)))
        this.router.get('/:id/info/person', asyncHandler(this.getPerson.bind(this)))
        this.router.get('/:id/info/organization', asyncHandler(this.getOrganization.bind(this)))
        this.router.put('/:id/info/person/fname', asyncHandler(this.putFname.bind(this)))
        this.router.put('/:id/info/person/lname', asyncHandler(this.putLname.bind(this)))
        this.router.put('/:id/info/person/photo', this.multer.single('photo'), asyncHandler(this.putPhoto.bind(this)))
        this.router.put('/:id/info/person/university', asyncHandler(this.putUniversity.bind(this)))
        this.router.put('/:id/info/person/faculty', asyncHandler(this.putFaculty.bind(this)))
        this.router.put('/:id/info/person/about', asyncHandler(this.putAbout.bind(this)))
        this.router.put('/:id/info/person/email', asyncHandler(this.putEmail.bind(this)))
        this.router.put('/:id/info/person/sex', asyncHandler(this.putSex.bind(this)))
        this.router.put('/:id/info/person/bday', asyncHandler(this.putBday.bind(this)))
        this.router.post('/:id/admin/role/ban', asyncHandler(this.postBan.bind(this)))
        this.router.post('/:id/admin/doc/accept', asyncHandler(this.postAccept.bind(this)))
        this.router.post('/:id/admin/doc/dismiss', asyncHandler(this.postDismiss.bind(this)))
        this.router.get('/guest/whoami', asyncHandler(this.getWhoAmI.bind(this)))
        this.router.delete('/guest/logout', asyncHandler(this.deleteLogOut.bind(this)))

        this._mongoHandler = Mongo.getInstance()
    }


    get mongoHandler(): Mongo {
        return this._mongoHandler;
    }

    private async putAbout(req: Request, res: Response) {
        await new PutAboutHandler(this).handle(req, res)
    }
    private async putSex(req: Request, res: Response) {
        await new PutSexHandler(this).handle(req, res)
    }

    private async putBday(req: Request, res: Response) {
        await new PutBdayHandler(this).handle(req, res)
    }

    private async getWhoAmI(req: Request, res: Response) {
        /**
         * Returns user by JWT
         *
         * Response: GetUserResponse
         */

        await new GetWhoAmIHandler(this).handle(req, res)
    }

    private async postSignIn(req: Request, res: Response) {
        /**
         * Login existing user
         *
         * Response: SignInResponse
         */
        await new PostSignInHandler(this).handle(req, res)
    }

    private async postSignUp(req: Request, res: Response) {
        /**
         * Create new user without admin preferences
         *
         * Response: SignUpResponse
         */
        await new PostSignUpHandler(this).handle(req, res)
    }


    private async deleteLogOut(req: Request, res: Response) {
        /**
         * Create new user without admin preferences
         *
         * Response: CommonResponse
         */
        await new DeleteLogOutHandler(this).handle(req, res)
    }

    private async getBookmarks(req: Request, res: Response) {
        /**
         * Return users saved documents
         *
         * Response: GetUserResponse
         */
        await new GetBookmarksHandler(this).handle(req, res)
    }

    private async postAdmin(req: Request, res: Response) {
        /**
         * Ask for admin role
         *
         * Response: PostUserResponse
         */
        await this.changeRole(req, res, "pending")
    }

    private async changeRole(req: Request, res: Response, role: String) {
        await new ChangeRoleHandler(this).handle(req, res, role)
    }

    private async getPerson(req: Request, res: Response) {
        /**
         * Returns user by id
         *
         * Response: GetUserResponse
         */
        await new GetPersonHandler(this).handle(req, res)
    }

    private async getOrganization(req: Request, res: Response) {
        /**
         * Returns users organization
         *
         * Response: GetUserResponse
         */
        await new GetOrganizationHandler(this).handle(req, res)
    }

    private async putFname(req: Request, res: Response) {
        /**
         * Change users first name
         *
         * Response: PutUserResponse
         */
        await new PutFnameHandler(this).handle(req, res)
    }

    private async putLname(req: Request, res: Response) {
        /**
         * Change users last name
         *
         * Response: PutUserResponse
         */
        await new PutLnameHandler(this).handle(req, res)
    }

    private async putEmail(req: Request, res: Response) {
        /**
         * Change users last name
         *
         * Response: PutUserResponse
         */
        await new PutEmailHandler(this).handle(req, res)
    }

    private async putPhoto(req: Request, res: Response) {
        /**
         * Change users photo
         */
        await new PutPhotoHandler(this).handle(req, res)
    }

    private async putUniversity(req: Request, res: Response) {
        /**
         * Change users organization
         *
         * Response: PutUserResponse
         */
        await new PutUniversityHandler(this).handle(req, res)
    }

    private async putFaculty(req: Request, res: Response) {
        /**
         * Change users faculty, its User model property
         */
        await new PutFacultyHandler(this).handle(req, res)
    }

    private async postBan(req: Request, res: Response) {
        /**
         * Restrict some users actions
         */
        await this.changeRole(req, res, 'baned')
    }

    private async postAccept(req: Request, res: Response) {
        /**
         * Accept admin role by "super" user
         */
        await this.changeRole(req, res, 'admin')
    }

    private async postDismiss(req: Request, res: Response) {
        /**
         * Dismiss admin role by "super" user
         */
        await this.changeRole(req, res, 'user')
    }
}