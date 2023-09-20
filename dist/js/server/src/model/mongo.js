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
const mongoose_1 = __importDefault(require("mongoose"));
const documentSchema_1 = __importDefault(require("./schema/documentSchema"));
const organizationSchema_1 = __importDefault(require("./schema/organizationSchema"));
const userSchema_1 = __importDefault(require("./schema/userSchema"));
class Mongo {
    static getInstance() {
        return this._instance || (this._instance = new Mongo());
    }
    constructor() {
        const documentSchema = new mongoose_1.default.Schema(documentSchema_1.default);
        const organizationSchema = new mongoose_1.default.Schema(organizationSchema_1.default);
        const userSchema = new mongoose_1.default.Schema(userSchema_1.default);
        // indexes
        documentSchema.index({ name: 1, type: -1 });
        this.documentModel = mongoose_1.default.model('Document', documentSchema);
        this.organizationModel = mongoose_1.default.model('Organization', organizationSchema);
        this.userModel = mongoose_1.default.model('User', userSchema);
    }
    findDocumentByName(doc_name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.documentModel.find({ name: doc_name });
        });
    }
    findRelevantById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let doc = yield this.documentModel.findById(id);
            if (doc === null) {
                throw new Error("No such document with _id: " + id);
            }
            let relevants_id = doc.relevant;
            let addled;
            let check_exists = (doc_id) => __awaiter(this, void 0, void 0, function* () {
                return this.findDocumentById(doc_id).catch(err => addled.push(doc_id));
            });
            let requests = relevants_id.map(id => check_exists(id));
            yield Promise.all(requests);
            relevants_id.filter(el => !addled.includes(el));
            yield this.documentModel.updateOne({ _id: id }, { relevants: relevants_id });
            return relevants_id;
        });
    }
    findDocumentById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.documentModel.findById(id);
        });
    }
    findOrganizationByName(org_name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.organizationModel.findOne({ name: org_name });
        });
    }
    findOrganizationById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.organizationModel.findById(id);
        });
    }
    insertDocument(doc_name, theme, subtheme, author, sourceId, path, tags) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.documentModel.create({
                name: doc_name,
                theme: theme,
                subtheme: subtheme,
                author: author,
                sourceId: sourceId,
                content: path,
                tags: tags,
                rate: 0,
                votedNum: 0,
                created: Date.now()
            });
        });
    }
    updateRateDocumentById(id, score) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.documentModel.findById(id);
            if (doc === undefined || doc === null) {
                throw new Error("No such document with id: " + id);
            }
            if (!doc.rate || !doc.votedNum) {
                throw new Error("Wrong document format");
            }
            return yield this.documentModel.updateOne({ _id: id }, {
                votedNum: doc.votedNum + 1,
                // @ts-ignore
                rate: doc.rate + score / (doc.votedNum + 1)
            });
        });
    }
    changeContentDocumentById(id, new_path) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.documentModel.updateOne({ _id: id }, { content: new_path });
        });
    }
    insertUser(login, hashPassword, email, orgId, firstName, lastName, about, city, role, photo) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.create({
                organizationId: orgId,
                firstName: firstName,
                lastName: lastName,
                email: email,
                nickname: login,
                password: hashPassword,
                about: about,
                city: city,
                role: role,
                photo: photo,
                registered: Date.now()
            });
        });
    }
    findUserByName(fname, lname) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.findOne({
                firstName: fname,
                lastName: lname
            });
        });
    }
    findUserByNickname(nickname) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.findOne({
                nickname: nickname
            });
        });
    }
    changePhotoUserById(id, newPhotoPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.updateOne({ _id: id }, { photo: newPhotoPath });
        });
    }
    changeRoleUserById(id, role) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.updateOne({ _id: id }, { role: role });
        });
    }
    changeFirstNameUserById(id, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.updateOne({ _id: id }, { firstName: name });
        });
    }
    changeLastNameUserById(id, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.updateOne({ _id: id }, { lastName: name });
        });
    }
    changeUniversityUserById(id, orgId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.updateOne({ _id: id }, { organizationId: orgId });
        });
    }
    changeFacultyUserById(id, faculty) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.updateOne({ _id: id }, { faculty: faculty });
        });
    }
    changeAboutUserById(id, about) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.updateOne({ _id: id }, { about: about });
        });
    }
    changeSexUserById(id, sex) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.updateOne({ _id: id }, { sex: sex });
        });
    }
    changeBdayUserById(id, bday) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.updateOne({ _id: id }, { birthday: bday });
        });
    }
    changeEmailUserById(id, email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.updateOne({ _id: id }, { email: email });
        });
    }
    findUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.findById(id);
        });
    }
    insertOrganization(name, location, isMember, responsible, admins) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.organizationModel.create({
                name: name,
                location: location,
                isMember: isMember,
                responsible: responsible,
                admins: admins,
                admitted: Date.now()
            });
        });
    }
}
exports.default = Mongo;
//# sourceMappingURL=mongo.js.map