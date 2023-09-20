"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileChecker = exports.BooleanChecker = exports.ArrayStringChecker = exports.StringChecker = exports.Checker = void 0;
const errors_1 = require("./errors");
class RequestValueError extends errors_1.BadRequestError {
    constructor(message, userMessage) {
        super(message);
        this.userMessage = userMessage;
        Object.setPrototypeOf(this, RequestValueError.prototype);
    }
    describe() {
        return {
            status: 'bad-request',
            message: this.message,
            userMessage: this.userMessage
        };
    }
}
class Checker {
    constructor(nullable = false) {
        this.nullable = nullable;
    }
    checkNull(name, input) {
        if (input === null || input === undefined) {
            if (this.nullable) {
                return true;
            }
            else {
                this.reportNull(name);
            }
        }
        return false;
    }
    reportNull(name) {
        throw new RequestValueError("null-unexpected", "Unexpected null value for parameter '" + name + "'");
    }
    reportMismatch(name, expected, got) {
        throw new RequestValueError("type-mismatch", "Type mismatch for parameter '" + name + "': expected " + expected + " , got " + got);
    }
    check(name, input) {
        return input;
    }
}
exports.Checker = Checker;
class StringChecker extends Checker {
    check(name, input) {
        if (this.checkNull(name, input)) {
            return null;
        }
        if (typeof input !== 'string') {
            this.reportMismatch(name, "string", typeof input);
        }
        return input;
    }
}
exports.StringChecker = StringChecker;
StringChecker.necessary = new StringChecker();
StringChecker.nullable = new StringChecker(true);
class ArrayStringChecker extends Checker {
    check(name, input) {
        if (this.checkNull(name, input)) {
            return null;
        }
        if (!Array.isArray(input)) {
            this.reportMismatch(name, "array", typeof input);
        }
        for (let i = 0; i < input.length; i++) {
            if (typeof input[i] !== 'string') {
                this.reportMismatch(name + "[" + i + "]", "string", typeof input[i]);
            }
        }
        return input;
    }
}
exports.ArrayStringChecker = ArrayStringChecker;
ArrayStringChecker.instance = new ArrayStringChecker();
ArrayStringChecker.nullable = new ArrayStringChecker(true);
class BooleanChecker extends Checker {
    check(name, input) {
        if (this.checkNull(name, input)) {
            return null;
        }
        if (typeof input !== 'boolean') {
            this.reportMismatch(name, "boolean", typeof input);
        }
    }
}
exports.BooleanChecker = BooleanChecker;
BooleanChecker.instance = new BooleanChecker();
BooleanChecker.nullable = new BooleanChecker(true);
class FileChecker extends Checker {
    check(name, input) {
        if (this.checkNull(name, input)) {
            return null;
        }
        let path = input === null || input === void 0 ? void 0 : input.path;
        if (!path) {
            this.reportMismatch(name, "file", typeof input);
        }
        return input;
    }
}
exports.FileChecker = FileChecker;
FileChecker.instance = new FileChecker();
FileChecker.nullable = new FileChecker(true);
class NumberChecker extends Checker {
    check(name, input) {
        if (this.checkNull(name, input)) {
            return null;
        }
        if (typeof input !== 'number') {
            throw new Error("Type mismatching");
        }
        return input;
    }
}
NumberChecker.instance = new FileChecker();
NumberChecker.nullable = new FileChecker(true);
//# sourceMappingURL=checker.js.map