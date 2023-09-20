export type OkResponse = {
    status: 'ok'
}

export type ValueErrorResponse = {
    status: 'value-error',
    message: string
}

export type BadRequestResponse = {
    status: 'bad-request',
    message: string
}

export type ServerErrorResponse = {
    status: 'internal-error',
    message: string
}

export type AuthResponse = {
    status: 'ok' | 'error',
    message: 'token-expected' | 'token-invalid'
}

export type SignUpValueErrorResponse = ValueErrorResponse & { message: 'existing-login'}
export type SignInValueErrorResponse = ValueErrorResponse & { message: 'wrong-login' | 'wrong-password' }

export type CommonResponse = OkResponse | ServerErrorResponse

export type SignInResponse = ServerErrorResponse |
    BadRequestResponse |
    SignInValueErrorResponse |
    OkResponse & { value: string }

export type SignUpResponse = ServerErrorResponse |
    BadRequestResponse |
    SignUpValueErrorResponse |
    OkResponse & { value: string }

export type GetUserResponse = OkResponse & {value: any} |
    ServerErrorResponse |
    BadRequestResponse |
    ValueErrorResponse & {message: 'no-such-id'}

export type PostUserResponse = CommonResponse |
    BadRequestResponse |
    ValueErrorResponse & {message: 'no-such-id'}

export type PutUserResponse = CommonResponse |
    BadRequestResponse & {message: 'missing-photo' | 'missing-id'}|
    ValueErrorResponse & {message: 'no-such-id'}

export type GetDocumentResponse = OkResponse & {value: any} |
    ServerErrorResponse |
    BadRequestResponse |
    ValueErrorResponse & {message: 'no-such-document'}