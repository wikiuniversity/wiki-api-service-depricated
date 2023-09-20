"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DescriptiveErrorResponse = exports.BadRequestError = exports.ValueError = void 0;
class ValueError extends Error {
    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, ValueError.prototype);
    }
    describe() {
        return {
            status: 'value-error',
            message: this.message
        };
    }
}
exports.ValueError = ValueError;
class BadRequestError extends Error {
    constructor(msg, code = 400) {
        super(msg);
        this.code = code;
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
    describe() {
        return {
            status: 'bad-request',
            message: this.message
        };
    }
}
exports.BadRequestError = BadRequestError;
class DescriptiveErrorResponse extends Error {
    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, DescriptiveErrorResponse.prototype);
    }
    describe() {
        return {
            status: 'internal-error',
            message: this.message
        };
    }
}
exports.DescriptiveErrorResponse = DescriptiveErrorResponse;
//# sourceMappingURL=errors.js.map