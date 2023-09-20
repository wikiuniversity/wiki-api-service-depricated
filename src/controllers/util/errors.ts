import {BadRequestResponse, ServerErrorResponse, ValueErrorResponse} from "../../../../shared/response";

export class ValueError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, ValueError.prototype)
    }

    public describe(): ValueErrorResponse {
        return {
            status: 'value-error',
            message: this.message
        }
    }
}

export class BadRequestError extends Error {
    public code: number

    constructor(msg: string, code: number = 400) {
        super(msg);
        this.code = code
        Object.setPrototypeOf(this, BadRequestError.prototype)
    }

    public describe(): BadRequestResponse {
        return {
            status: 'bad-request',
            message: this.message
        }
    }
}

export class DescriptiveErrorResponse extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, DescriptiveErrorResponse.prototype)
    }

    public describe(): ServerErrorResponse {
        return {
            status: 'internal-error',
            message: this.message
        }
    }
}