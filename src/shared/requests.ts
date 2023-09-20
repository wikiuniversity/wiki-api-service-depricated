
export type ServerResponse = {
    status: string
}

export type ErrorResponse = {
    status: "error"
    message: string // "Such email is already present"
    type: string // "email-present"
}

export type OkResponse = {
    status: "ok"
}

export type SignUpResponse = ServerResponse & (
    OkResponse |
    (ErrorResponse & {
        type: "email-present" | "no-such-org" | "no-such-theme" | "no-such-subtheme" | "no-such-role"
    }
))

export type SignInResponse = ServerResponse & (ErrorResponse | OkResponse | {
    status: "wrong-password" | "no-such-user"
})

export type UserInfoResponse = ServerResponse & (ErrorResponse & {
    type: "not-authorized"
} | OkResponse & {
    user: {
        id: string
        email: string
        role: string
        org: string
        theme: string
    }
})

export type AnyResponse = SignInResponse | SignUpResponse | UserInfoResponse