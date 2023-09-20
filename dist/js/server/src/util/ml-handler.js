"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const net = __importStar(require("net"));
const events_1 = require("events");
class MlHandler extends events_1.EventEmitter {
    constructor(url) {
        super();
        this.url = url;
        this.socket = new net.Socket();
        this.connected = false;
        this.lastRequestId = 0;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connected) {
                return;
            }
            yield new Promise((resolve, reject) => {
                this.socket.connect(this.url, () => {
                    this.connected = true;
                    resolve();
                });
                this.socket.on("error", (err) => {
                    reject(err);
                });
            });
        });
    }
    postRequest(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connect();
            // Construct the request object
            const requestId = ++this.lastRequestId;
            const request = {
                id: requestId,
                filePath,
                // Include any other relevant request properties
            };
            // Send the request to the socket
            this.socket.write(JSON.stringify(request));
            // Return a promise that resolves when the response with the correct ID is received
            return new Promise((resolve) => {
                const onResponse = (response) => {
                    if (response.id === requestId) {
                        this.removeListener("response", onResponse);
                        resolve(response);
                    }
                };
                this.on("response", onResponse);
            });
        });
    }
    disconnect() {
        if (!this.connected) {
            return;
        }
        this.socket.destroy();
        this.connected = false;
    }
    handleResponse(data) {
        try {
            const response = JSON.parse(data);
            this.emit("response", response);
        }
        catch (err) {
            console.error(err);
        }
    }
    handleData(data) {
        let remainingData = data.toString();
        let endIndex = remainingData.indexOf("\n");
        while (endIndex >= 0) {
            const message = remainingData.substring(0, endIndex);
            this.handleResponse(message);
            remainingData = remainingData.substring(endIndex + 1);
            endIndex = remainingData.indexOf("\n");
        }
    }
    handleError(err) {
        console.error(err);
        this.disconnect();
    }
    handleClose() {
        this.connected = false;
        this.emit("close");
    }
    start() {
        this.socket.on("data", this.handleData.bind(this));
        this.socket.on("error", this.handleError.bind(this));
        this.socket.on("close", this.handleClose.bind(this));
    }
}
exports.default = MlHandler;
//# sourceMappingURL=ml-handler.js.map