export interface GetDocumentQuery {
    params: {
        id: string
    }
}

export interface PostNewDocumentQuery {
    params: {
        id: string
    }

    query: {
        file: any // TODO insert Express.Multer.File
        theme: string
        subtheme: string
        author: string
        org_name: string
        tags: string[]
    }
}