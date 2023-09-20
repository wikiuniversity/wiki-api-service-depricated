import mongoose from "mongoose";
import { readFileSync } from 'fs';
import * as Console from "console";
import docSchema from "./schema/documentSchema"
import orgSchema from "./schema/organizationSchema"
import usrSchema from "./schema/userSchema"
import MongoHandler from "../util/mongo-handler";
import bcrypt from "bcrypt";


export default class Mongo {
    private documentModel;
    private organizationModel;
    private userModel;

    private static _instance: Mongo;
    public static getInstance() {
        return this._instance || (this._instance = new Mongo())
    }
    constructor() {
        const documentSchema = new mongoose.Schema(docSchema)
        const organizationSchema = new mongoose.Schema(orgSchema)
        const userSchema = new mongoose.Schema(usrSchema)

        // indexes
        documentSchema.index({name: 1, type: -1})

        this.documentModel = mongoose.model('Document', documentSchema)
        this.organizationModel = mongoose.model('Organization', organizationSchema)
        this.userModel = mongoose.model('User', userSchema)

    }

    public async findDocumentByName(doc_name: String) {
        return await this.documentModel.find({name: doc_name})
    }

    public async findRelevantById(id: String) {
        let doc = await this.documentModel.findById(id)
        if (doc === null) {
            throw new Error("No such document with _id: " + id)
        }
        let relevants_id = doc.relevant
        let addled : String[]
        let check_exists = async (doc_id: String) => {
            return this.findDocumentById(doc_id).catch(
                err => addled.push(doc_id)
            )
        }
        let requests = relevants_id.map(id => check_exists(id))
        await Promise.all(requests)
        relevants_id.filter(
            el => !addled.includes(el)
        )
        await this.documentModel.updateOne(
            {_id: id},
            {relevants: relevants_id}
        )
        return relevants_id
    }

    public async findDocumentById(id: String) {
        return await this.documentModel.findById(id)
    }

    public async findOrganizationByName(org_name: string) {
        return await this.organizationModel.findOne({name: org_name})
    }

    public async findOrganizationById(id: string) {
        return await this.organizationModel.findById(id)
    }

    public async insertDocument(doc_name: string, theme: string, subtheme: string, author: string, sourceId: string, path: string, tags: Array<string>) {
        return await this.documentModel.create({
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
        })
    }

    public async updateRateDocumentById(id: String, score: Number) {
        const doc = await this.documentModel.findById(id)

        if (doc === undefined || doc === null) {
            throw new Error("No such document with id: " + id)
        }

        if (!doc.rate || !doc.votedNum) {
            throw new Error("Wrong document format")
        }

        return await this.documentModel.updateOne(
            {_id: id},

            {
                votedNum: doc.votedNum + 1,
                // @ts-ignore
                rate: doc.rate + score / (doc.votedNum + 1)
            }
        )

    }

    public async changeContentDocumentById(id: Number, new_path: String) {
        return await this.documentModel.updateOne(
            {_id: id},
            {content: new_path}
        )
    }

    public async insertUser(login: string,
                            hashPassword: string,
                            email: string,
                            orgId: string | null,
                            firstName: string,
                            lastName: string,
                            about: string | null,
                            city: string | null,
                            role: string,
                            photo: string | null) {
        return await this.userModel.create({
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
        })
    }

    public async findUserByName(fname: string, lname: string) {
        return await this.userModel.findOne({
            firstName: fname,
            lastName: lname
        })
    }

    public async findUserByNickname(nickname: string) {
        return await this.userModel.findOne({
            nickname: nickname
        })
    }

    public async changePhotoUserById(id: string, newPhotoPath: string) {
        return await this.userModel.updateOne(
            {_id: id},
            {photo: newPhotoPath}
        )
    }

    public async changeRoleUserById(id: string, role: string) {
        return await this.userModel.updateOne(
            {_id: id},
            {role: role}
        )
    }

    public async changeFirstNameUserById(id: string, name: string) {
        return await this.userModel.updateOne(
            {_id: id},
            {firstName: name}
        )
    }

    public async changeLastNameUserById(id: string, name: string) {
        return await this.userModel.updateOne(
            {_id: id},
            {lastName: name}
        )
    }

    public async changeUniversityUserById(id: string, orgId: string) {
        return await this.userModel.updateOne(
            {_id: id},
            {organizationId: orgId}
        )
    }

    public async changeFacultyUserById(id: string, faculty: string) {
        return await this.userModel.updateOne(
            {_id: id},
            {faculty: faculty}
        )
    }

    public async changeAboutUserById(id: any, about: string) {
        return await this.userModel.updateOne(
            {_id: id},
            {about: about}
        )
    }

    public async changeSexUserById(id: any, sex: string) {
        return await this.userModel.updateOne(
            {_id: id},
            {sex: sex}
        )
    }

    public async changeBdayUserById(id: any, bday: string) {
        return await this.userModel.updateOne(
            {_id: id},
            {birthday: bday}
        )
    }

    public async changeEmailUserById(id: any, email: string) {
        return await this.userModel.updateOne(
            {_id: id},
            {email: email}
        )
    }

    public async findUserById(id: string) {
        return await this.userModel.findById(id)
    }

    public async insertOrganization(name: string,
                                    location: string,
                                    isMember: boolean,
                                    responsible: string,
                                    admins: Array<string>) {
        return await this.organizationModel.create({
            name: name,
            location: location,
            isMember: isMember,
            responsible: responsible,
            admins: admins,
            admitted: Date.now()
        })
    }
}