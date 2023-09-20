export interface PostRegisterQuery {
    params: {
        id: string
    }

    query: {
        respFname: string
        respLname: string
        name: string
        location: string
        isMember: boolean
        admins: string[]
    }
}