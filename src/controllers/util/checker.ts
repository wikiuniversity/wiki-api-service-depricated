import {BadRequestError} from "./errors";
import {BadRequestResponse} from "../../../../shared/response";
import multer from "multer";

interface RequestValueResponse extends BadRequestResponse {
    message: "type-mismatch" | "null-unexpected"
    userMessage: string
}

class RequestValueError extends BadRequestError {
    private userMessage: string;

    constructor(message: "type-mismatch" | "null-unexpected", userMessage: string) {
        super(message);
        this.userMessage = userMessage
        Object.setPrototypeOf(this, RequestValueError.prototype)
    }

    describe() {
        return {
            status: 'bad-request',
            message: this.message,
            userMessage: this.userMessage
        } as RequestValueResponse
    }
}

export class Checker {
    public readonly nullable: boolean

    constructor(nullable: boolean = false) {
        this.nullable = nullable
    }

    protected checkNull(name: string, input: any) {
        if(input === null || input === undefined) {
            if(this.nullable) {
                return true
            } else {
                this.reportNull(name)
            }
        }
        return false
    }

    reportNull(name: string) {
        throw new RequestValueError("null-unexpected", "Unexpected null value for parameter '" + name + "'")
    }

    reportMismatch(name: string, expected: string, got: string) {
        throw new RequestValueError("type-mismatch", "Type mismatch for parameter '" + name + "': expected " + expected + " , got " + got)
    }

    check(name: string, input: any): any {
        return input
    }
}

export class StringChecker extends Checker {
    static readonly necessary = new StringChecker()
    static readonly nullable = new StringChecker(true)

    check(name: string, input: any): any {
        if(this.checkNull(name, input)) {
            return null
        }

        if (typeof input !== 'string') {
            this.reportMismatch(name, "string", typeof input)
        }
        return input
    }
}

export class ArrayStringChecker extends Checker {
    static readonly instance = new ArrayStringChecker()
    static readonly nullable = new ArrayStringChecker(true)

    check(name: string, input: any): any {
        if(this.checkNull(name, input)) {
            return null
        }

        if (!Array.isArray(input)) {
            this.reportMismatch(name, "array", typeof input)
        }
        for (let i = 0; i < input.length; i++) {
            if (typeof input[i] !== 'string') {
                this.reportMismatch(name + "[" + i + "]", "string", typeof input[i])
            }
        }
        return input
    }
}


export class BooleanChecker extends Checker {
    static readonly instance = new BooleanChecker()
    static readonly nullable = new BooleanChecker(true)

    check(name: string, input: any): any {
        if(this.checkNull(name, input)) {
            return null
        }

        if (typeof input !== 'boolean') {
            this.reportMismatch(name, "boolean", typeof input)
        }
    }
}

export class FileChecker extends Checker {
    static readonly instance = new FileChecker()
    static readonly nullable = new FileChecker(true)

    check(name: string, input: any): any {
        if(this.checkNull(name, input)) {
            return null
        }

        let path = input?.path

        if (!path) {
            this.reportMismatch(name, "file", typeof input)
        }
        return input
    }
}

class NumberChecker extends Checker {
    static readonly instance = new FileChecker()
    static readonly nullable = new FileChecker(true)

    check(name: string, input: any): any {
        if(this.checkNull(name, input)) {
            return null
        }
        if (typeof input !== 'number') {
            throw new Error("Type mismatching")
        }
        return input
    }
}