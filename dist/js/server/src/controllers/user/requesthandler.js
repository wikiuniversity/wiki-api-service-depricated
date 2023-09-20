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
exports.PutBdayHandler = exports.PutSexHandler = exports.PutAboutHandler = exports.GetWhoAmIHandler = exports.PutFacultyHandler = exports.PutUniversityHandler = exports.PutPhotoHandler = exports.PutEmailHandler = exports.PutLnameHandler = exports.PutFnameHandler = exports.GetOrganizationHandler = exports.GetPersonHandler = exports.ChangeRoleHandler = exports.DeleteLogOutHandler = exports.PostSignInHandler = exports.PostSignUpHandler = exports.GetBookmarksHandler = void 0;
const requesthandler_1 = require("../util/requesthandler");
const checker_1 = require("../util/checker");
const bcrypt_1 = __importDefault(require("bcrypt"));
const fs_1 = require("fs");
const data_manage_config_json_1 = __importDefault(require("../../util/conf/data-manage-config.json"));
const auth_config_json_1 = __importDefault(require("../../util/conf/auth-config.json"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../util/errors");
const auth_1 = require("../../auth/auth");
const _createToken = function (user) {
    const payload = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName
    };
    return jsonwebtoken_1.default.sign(payload, auth_config_json_1.default.TOKEN_SECRET);
};
class SignUpValueError extends errors_1.ValueError {
    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, SignUpValueError.prototype);
    }
    describe() {
        return {
            status: 'value-error',
            message: this.message
        };
    }
}
class UserBaseHandler extends requesthandler_1.RequestHandler {
    constructor(controller) {
        super();
        this.controller_ = controller;
    }
}
class GetBookmarksHandler extends UserBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' }
            ]);
            let id = query.params.id;
            const user = yield this.controller_.mongoHandler.findUserById(id);
            if (!user) {
                throw new errors_1.ValueError("no-such-user");
            }
            res.status(200).send({
                status: 'ok',
                value: user.bookmarks
            });
        });
    }
}
exports.GetBookmarksHandler = GetBookmarksHandler;
class PostSignUpHandler extends UserBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'password', checker: checker_1.StringChecker.necessary, type: 'query' },
                { name: 'login', checker: checker_1.StringChecker.necessary, type: 'query' },
                { name: 'email', checker: checker_1.StringChecker.necessary, type: 'query' },
                { name: 'org_name', checker: checker_1.StringChecker.nullable, type: 'query' },
                { name: 'firstName', checker: checker_1.StringChecker.nullable, type: 'query' },
                { name: 'lastName', checker: checker_1.StringChecker.nullable, type: 'query' },
                { name: 'file', checker: checker_1.FileChecker.nullable, type: 'query' },
                { name: 'about', checker: checker_1.StringChecker.nullable, type: 'query' },
                { name: 'city', checker: checker_1.StringChecker.nullable, type: 'query' }
            ]);
            const token = yield this.uploadNewUser(query);
            res.status(200).send({
                status: 'ok',
                value: token
            });
        });
    }
    uploadNewUser(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const pwd = query.query.password;
            const login = query.query.login;
            const email = query.query.email;
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashPassword = yield bcrypt_1.default.hash(pwd, salt);
            const existingUserLogin = yield this.controller_.mongoHandler.findUserByNickname(login);
            if (existingUserLogin) {
                throw new SignUpValueError('existing-login');
            }
            let org_id = null;
            if (query.query.orgName) {
                let org = yield this.controller_.mongoHandler.findOrganizationByName(query.query.orgName);
                org_id = org === null || org === void 0 ? void 0 : org.id;
            }
            let photo_path = null;
            if (query.query.file) {
                photo_path = query.query.file.path;
            }
            let about_value = null;
            if (query.query.about) {
                about_value = query.query.about;
            }
            let city_value = null;
            if (query.query.city) {
                city_value = query.query.city;
            }
            let savedUser = yield this.controller_.mongoHandler.insertUser(login, hashPassword, email, org_id, query.query.firstName, query.query.lastName, about_value, city_value, 'user', photo_path);
            if (photo_path) {
                let newPath = data_manage_config_json_1.default.photoPath + savedUser.id;
                // @ts-ignore
                (0, fs_1.copyFileSync)(savedUser.photo, newPath);
                // @ts-ignore
                (0, fs_1.unlink)(savedUser.photo, function () {
                });
            }
            // TODO: replace with type returned by mongo
            // @ts-ignore
            return _createToken(savedUser);
        });
    }
}
exports.PostSignUpHandler = PostSignUpHandler;
class PostSignInHandler extends UserBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'password', checker: checker_1.StringChecker.necessary, type: 'query' },
                { name: 'login', checker: checker_1.StringChecker.necessary, type: 'query' },
            ]);
            const pwd = query.query.password;
            const login = query.query.login;
            let user = yield this.controller_.mongoHandler.findUserByNickname(login);
            if (user === null || user === undefined) {
                // TODO: add a new error type
                throw new errors_1.ValueError('wrong-login');
            }
            // @ts-ignore
            const isValid = yield bcrypt_1.default.compare(pwd, user.password);
            if (!isValid) {
                // TODO: add a new error type
                throw new errors_1.ValueError('wrong-password');
            }
            // TODO: replace with type returned by mongo
            // @ts-ignore
            const token = _createToken(user);
            res.status(200).send({
                status: 'ok',
                value: token
            });
        });
    }
}
exports.PostSignInHandler = PostSignInHandler;
class DeleteLogOutHandler extends UserBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.clearCookie("jwt", {
                httpOnly: true,
                sameSite: 'none',
                secure: true
            });
            res.status(200).send({
                status: 'ok'
            });
        });
    }
}
exports.DeleteLogOutHandler = DeleteLogOutHandler;
class ChangeRoleHandler extends UserBaseHandler {
    handle(req, res, role) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
            ]);
            let id = query.params.id;
            let usr = yield this.controller_.mongoHandler.findUserById(id);
            // @ts-ignore
            yield this._mongoHandler.changeRoleUserById(usr === null || usr === void 0 ? void 0 : usr.id, role);
            res.status(200).send({
                message: 'ok'
            });
        });
    }
}
exports.ChangeRoleHandler = ChangeRoleHandler;
class GetPersonHandler extends UserBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
            ]);
            let id = query.params.id;
            const usr = yield this.controller_.mongoHandler.findUserById(id);
            res.status(200).send({
                status: 'ok',
                value: usr
            });
        });
    }
}
exports.GetPersonHandler = GetPersonHandler;
class GetOrganizationHandler extends UserBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
            ]);
            let id = query.params.id;
            const usr = yield this.controller_.mongoHandler.findUserById(id);
            if (!usr) {
                // TODO: add a new error type
                throw new errors_1.ValueError('no-such-user');
            }
            // TODO: what type of usr?
            // @ts-ignore
            const org = yield this._mongoHandler.findOrganizationById(usr.organizationId);
            if (!org) {
                // TODO: add a new error type
                throw new errors_1.ValueError('no-such-organization');
            }
            res.status(200).send(org);
        });
    }
}
exports.GetOrganizationHandler = GetOrganizationHandler;
class PutFnameHandler extends UserBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
                { name: 'firstName', checker: checker_1.StringChecker.necessary, type: 'query' },
            ]);
            let id = query.params.id;
            let usr = yield this.controller_.mongoHandler.findUserById(id);
            if (!usr) {
                // TODO: add a new error type
                throw new errors_1.ValueError('no-such-user');
            }
            yield this.controller_.mongoHandler.changeFirstNameUserById(usr === null || usr === void 0 ? void 0 : usr.id, query.query.firstName);
            res.status(200).send({
                status: 'ok'
            });
        });
    }
}
exports.PutFnameHandler = PutFnameHandler;
class PutLnameHandler extends UserBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
                { name: 'lastName', checker: checker_1.StringChecker.necessary, type: 'query' },
            ]);
            let id = query.params.id;
            let usr = yield this.controller_.mongoHandler.findUserById(id);
            if (!usr) {
                // TODO: add a new error type
                throw new errors_1.ValueError('no-such-user');
            }
            yield this.controller_.mongoHandler.changeLastNameUserById(usr === null || usr === void 0 ? void 0 : usr.id, query.query.lastName);
            res.status(200).send({
                status: 'ok'
            });
        });
    }
}
exports.PutLnameHandler = PutLnameHandler;
class PutEmailHandler extends UserBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
                { name: 'email', checker: checker_1.StringChecker.necessary, type: 'query' },
            ]);
            let id = query.params.id;
            let usr = yield this.controller_.mongoHandler.findUserById(id);
            if (!usr) {
                // TODO: add a new error type
                throw new errors_1.ValueError('no-such-user');
            }
            yield this.controller_.mongoHandler.changeEmailUserById(usr === null || usr === void 0 ? void 0 : usr.id, query.query.email);
            res.status(200).send({
                status: 'ok'
            });
        });
    }
}
exports.PutEmailHandler = PutEmailHandler;
class PutPhotoHandler extends UserBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
                { name: 'file', checker: checker_1.FileChecker.instance, type: 'query' },
            ]);
            let photo = query.query.file;
            let path = photo === null || photo === void 0 ? void 0 : photo.path;
            if (!path) {
                throw new errors_1.BadRequestError('missing-photo');
            }
            let id = req.params.id;
            let usr = yield this.controller_.mongoHandler.findUserById(id);
            if (!usr) {
                // TODO: add a new error type
                throw new errors_1.ValueError('no-such-user');
            }
            // @ts-ignore
            (0, fs_1.copyFileSync)(path, usr.photo);
            res.status(200).send({
                status: 'ok'
            });
        });
    }
}
exports.PutPhotoHandler = PutPhotoHandler;
class PutUniversityHandler extends UserBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
                { name: 'file', checker: checker_1.FileChecker.instance, type: 'query' },
            ]);
            let id = query.params.id;
            let usr = yield this.controller_.mongoHandler.findUserById(id);
            if (!usr) {
                // TODO: add a new error type
                throw new errors_1.ValueError('no-such-user');
            }
            yield this.controller_.mongoHandler.changeUniversityUserById(usr === null || usr === void 0 ? void 0 : usr.id, query.query.orgId);
            res.status(200).send({
                status: 'ok'
            });
        });
    }
}
exports.PutUniversityHandler = PutUniversityHandler;
class PutFacultyHandler extends UserBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
                { name: 'file', checker: checker_1.FileChecker.instance, type: 'query' },
            ]);
            let id = query.params.id;
            let usr = yield this.controller_.mongoHandler.findUserById(id);
            if (!usr) {
                // TODO: add a new error type
                throw new errors_1.ValueError('no-such-user');
            }
            yield this.controller_.mongoHandler.changeFacultyUserById(usr === null || usr === void 0 ? void 0 : usr.id, query.query.faculty);
            res.status(200).send({
                status: 'ok'
            });
        });
    }
}
exports.PutFacultyHandler = PutFacultyHandler;
class GetWhoAmIHandler extends UserBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = (0, auth_1.verifyJWT)(req, res);
            if (!token) {
                return;
            }
            const decodedToken = jsonwebtoken_1.default.decode(token);
            if (!decodedToken) {
                throw new errors_1.BadRequestError('invalid-token');
            }
            const userId = decodedToken.id;
            const usr = yield this.controller_.mongoHandler.findUserById(userId);
            if (!usr) {
                res.status(200).send({
                    status: 'ok',
                    value: null
                });
                return;
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
            };
            res.status(200).send({
                status: 'ok',
                value: value
            });
        });
    }
}
exports.GetWhoAmIHandler = GetWhoAmIHandler;
class PutAboutHandler extends UserBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
                { name: 'about', checker: checker_1.StringChecker.necessary, type: 'query' },
            ]);
            let id = query.params.id;
            let usr = yield this.controller_.mongoHandler.findUserById(id);
            if (!usr) {
                res.status(400).send({
                    status: 'value-error',
                    message: 'no-such-id'
                });
                return;
            }
            yield this.controller_.mongoHandler.changeAboutUserById(usr._id, query.query.about);
            res.status(200).send({
                status: 'ok'
            });
        });
    }
}
exports.PutAboutHandler = PutAboutHandler;
class PutSexHandler extends UserBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
                { name: 'sex', checker: checker_1.StringChecker.necessary, type: 'query' },
            ]);
            let id = query.params.id;
            let usr = yield this.controller_.mongoHandler.findUserById(id);
            if (!usr) {
                res.status(400).send({
                    status: 'value-error',
                    message: 'no-such-id'
                });
                return;
            }
            yield this.controller_.mongoHandler.changeSexUserById(usr._id, query.query.sex);
            res.status(200).send({
                status: 'ok'
            });
        });
    }
}
exports.PutSexHandler = PutSexHandler;
class PutBdayHandler extends UserBaseHandler {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.parseQuery(req, [
                { name: 'id', checker: checker_1.StringChecker.necessary, type: 'params' },
                { name: 'birthday', checker: checker_1.StringChecker.necessary, type: 'query' },
            ]);
            let id = query.params.id;
            let usr = yield this.controller_.mongoHandler.findUserById(id);
            if (!usr) {
                res.status(400).send({
                    status: 'value-error',
                    message: 'no-such-id'
                });
                return;
            }
            yield this.controller_.mongoHandler.changeBdayUserById(usr._id, query.query.birthday);
            res.status(200).send({
                status: 'ok'
            });
        });
    }
}
exports.PutBdayHandler = PutBdayHandler;
//# sourceMappingURL=requesthandler.js.map