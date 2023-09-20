import {
    PostSignInQueryPayload,
    PostSignUpQueryPayload,
    PutFnameQueryPayload,
    PutLnameQueryPayload,
    PutPhotoQueryPayload,
    PutUniversityQueryPayload,
    PutFacultyQueryPayload,
    PutAboutQueryPayload,
    PutSexQueryPayload,
    PutBdayQueryPayload, PutEmailQueryPayload
} from "../../../../shared/query-payload"

export interface GetUserQuery {
    params: {
        id: string
    }
}

export interface PostSignUpQuery {
    query: PostSignUpQueryPayload
}

export interface PostSignInQuery {
    query: PostSignInQueryPayload
}

export interface PutFnameQuery {
    params: {
        id: string
    }

    query: PutFnameQueryPayload
}

export interface PutLnameQuery {
    params: {
        id: string
    }

    query: PutLnameQueryPayload
}

export interface PutEmailQuery {
    params: {
        id: string
    }

    query: PutEmailQueryPayload
}

export interface PutPhotoQuery {
    params: {
        id: string
    }

    query: PutPhotoQueryPayload
}

export interface PutUniversityQuery {
    params: {
        id: string
    }

    query: PutUniversityQueryPayload
}

export interface PutFacultyQuery {
    params: {
        id: string
    }

    query: PutFacultyQueryPayload
}

export interface PutAboutQuery {
    params: {
        id: string
    }
    query: PutAboutQueryPayload
}

export interface PutSexQuery {
    params: {
        id: string
    }

    query: PutSexQueryPayload
}

export interface PutBdayQuery {
    params: {
        id: string
    }

    query: PutBdayQueryPayload
}