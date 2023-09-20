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
const multer_1 = __importDefault(require("multer"));
const data_manage_config_json_1 = __importDefault(require("../../util/conf/data-manage-config.json"));
const auth_1 = require("../../auth/auth");
const requesthandler_1 = require("./requesthandler");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
class RequestValueError extends Error {
    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, RequestValueError.prototype);
    }
}
class DataError extends Error {
    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, RequestValueError.prototype);
    }
    describe() {
        return {
            status: 'value-error',
            message: this.message
        };
    }
}
class UserController {
    constructor(server) {
        this.router = (0, express_1.Router)();
        this.server = server;
        this.storage = multer_1.default.diskStorage({
            destination: function (req, file, cb) {
                cb(null, data_manage_config_json_1.default.photoLobbyPath);
            },
            filename: function (req, file, cb) {
                cb(null, file.fieldname + '-' + Date.now());
            }
        });
        this.multer = (0, multer_1.default)({ storage: this.storage });
        this.router.get('/:id/bookmarks', auth_1.authenticateJWT, (0, express_async_handler_1.default)(this.getBookmarks.bind(this))); // TODO: authenticate to all needed
        this.router.get('/guest/signup', this.multer.single('photo'), (0, express_async_handler_1.default)(this.postSignUp.bind(this)));
        this.router.get('/guest/signin', (0, express_async_handler_1.default)(this.postSignIn.bind(this)));
        this.router.post('/:id/role/admin', (0, express_async_handler_1.default)(this.postAdmin.bind(this)));
        this.router.get('/:id/info/person', (0, express_async_handler_1.default)(this.getPerson.bind(this)));
        this.router.get('/:id/info/organization', (0, express_async_handler_1.default)(this.getOrganization.bind(this)));
        this.router.put('/:id/info/person/fname', (0, express_async_handler_1.default)(this.putFname.bind(this)));
        this.router.put('/:id/info/person/lname', (0, express_async_handler_1.default)(this.putLname.bind(this)));
        this.router.put('/:id/info/person/photo', this.multer.single('photo'), (0, express_async_handler_1.default)(this.putPhoto.bind(this)));
        this.router.put('/:id/info/person/university', (0, express_async_handler_1.default)(this.putUniversity.bind(this)));
        this.router.put('/:id/info/person/faculty', (0, express_async_handler_1.default)(this.putFaculty.bind(this)));
        this.router.put('/:id/info/person/about', (0, express_async_handler_1.default)(this.putAbout.bind(this)));
        this.router.put('/:id/info/person/email', (0, express_async_handler_1.default)(this.putEmail.bind(this)));
        this.router.put('/:id/info/person/sex', (0, express_async_handler_1.default)(this.putSex.bind(this)));
        this.router.put('/:id/info/person/bday', (0, express_async_handler_1.default)(this.putBday.bind(this)));
        this.router.post('/:id/admin/role/ban', (0, express_async_handler_1.default)(this.postBan.bind(this)));
        this.router.post('/:id/admin/doc/accept', (0, express_async_handler_1.default)(this.postAccept.bind(this)));
        this.router.post('/:id/admin/doc/dismiss', (0, express_async_handler_1.default)(this.postDismiss.bind(this)));
        this.router.get('/guest/whoami', (0, express_async_handler_1.default)(this.getWhoAmI.bind(this)));
        this.router.delete('/guest/logout', (0, express_async_handler_1.default)(this.deleteLogOut.bind(this)));
        this._mongoHandler = mongo_1.default.getInstance();
    }
    get mongoHandler() {
        return this._mongoHandler;
    }
    putAbout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new requesthandler_1.PutAboutHandler(this).handle(req, res);
        });
    }
    putSex(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new requesthandler_1.PutSexHandler(this).handle(req, res);
        });
    }
    putBday(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new requesthandler_1.PutBdayHandler(this).handle(req, res);
        });
    }
    getWhoAmI(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Returns user by JWT
             *
             * Response: GetUserResponse
             */
            yield new requesthandler_1.GetWhoAmIHandler(this).handle(req, res);
        });
    }
    postSignIn(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Login existing user
             *
             * Response: SignInResponse
             */
            yield new requesthandler_1.PostSignInHandler(this).handle(req, res);
        });
    }
    postSignUp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Create new user without admin preferences
             *
             * Response: SignUpResponse
             */
            yield new requesthandler_1.PostSignUpHandler(this).handle(req, res);
        });
    }
    deleteLogOut(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Create new user without admin preferences
             *
             * Response: CommonResponse
             */
            yield new requesthandler_1.DeleteLogOutHandler(this).handle(req, res);
        });
    }
    getBookmarks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Return users saved documents
             *
             * Response: GetUserResponse
             */
            yield new requesthandler_1.GetBookmarksHandler(this).handle(req, res);
        });
    }
    postAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Ask for admin role
             *
             * Response: PostUserResponse
             */
            yield this.changeRole(req, res, "pending");
        });
    }
    changeRole(req, res, role) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new requesthandler_1.ChangeRoleHandler(this).handle(req, res, role);
        });
    }
    getPerson(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Returns user by id
             *
             * Response: GetUserResponse
             */
            yield new requesthandler_1.GetPersonHandler(this).handle(req, res);
        });
    }
    getOrganization(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Returns users organization
             *
             * Response: GetUserResponse
             */
            yield new requesthandler_1.GetOrganizationHandler(this).handle(req, res);
        });
    }
    putFname(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Change users first name
             *
             * Response: PutUserResponse
             */
            yield new requesthandler_1.PutFnameHandler(this).handle(req, res);
        });
    }
    putLname(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Change users last name
             *
             * Response: PutUserResponse
             */
            yield new requesthandler_1.PutLnameHandler(this).handle(req, res);
        });
    }
    putEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Change users last name
             *
             * Response: PutUserResponse
             */
            yield new requesthandler_1.PutEmailHandler(this).handle(req, res);
        });
    }
    putPhoto(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Change users photo
             */
            yield new requesthandler_1.PutPhotoHandler(this).handle(req, res);
        });
    }
    putUniversity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Change users organization
             *
             * Response: PutUserResponse
             */
            yield new requesthandler_1.PutUniversityHandler(this).handle(req, res);
        });
    }
    putFaculty(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Change users faculty, its User model property
             */
            yield new requesthandler_1.PutFacultyHandler(this).handle(req, res);
        });
    }
    postBan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Restrict some users actions
             */
            yield this.changeRole(req, res, 'baned');
        });
    }
    postAccept(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Accept admin role by "super" user
             */
            yield this.changeRole(req, res, 'admin');
        });
    }
    postDismiss(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Dismiss admin role by "super" user
             */
            yield this.changeRole(req, res, 'user');
        });
    }
}
exports.default = UserController;
//# sourceMappingURL=user.js.map