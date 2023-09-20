export interface PostSignUpQueryPayload {
    password: string
    login: string
    email: string
    orgName?: string
    firstName: string
    lastName: string
    file?: any // TODO insert Express.Multer.File
    about?: string
    city?: string
}

export interface PostSignInQueryPayload {
    password: string
    login: string
}

export interface PutFnameQueryPayload {
    firstName: string
}

export interface PutLnameQueryPayload {
    lastName: string
}

export interface PutEmailQueryPayload {
    email: string
}

export interface PutPhotoQueryPayload {
    file: any // TODO insert Express.Multer.File
}

export interface PutUniversityQueryPayload {
    file: any // TODO insert Express.Multer.File
    orgId: string
}

export interface PutFacultyQueryPayload {
    file: any // TODO insert Express.Multer.File
    faculty: string
}

export interface PutAboutQueryPayload {
    about: string
}

export interface PutSexQueryPayload {
    sex: string
}

export interface PutBdayQueryPayload {
    birthday: string
}