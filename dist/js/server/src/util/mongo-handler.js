"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_config_json_1 = __importDefault(require("../util/conf/connection-config.json"));
const mongoose_1 = __importDefault(require("mongoose"));
const tunnel_ssh_1 = require("tunnel-ssh");
class MongoHandler {
    static getInstance() {
        return this._instance || (this._instance = new MongoHandler());
    }
    constructor() {
        this.connection = mongoose_1.default.connection;
        this.connection.on('error', this.handleError.bind(this));
        this.connection.once('open', this.handleOpen.bind(this));
        this.tunnelOptions = {
            autoClose: true
        };
        this.serverOptions = {
            port: connection_config_json_1.default.port
        };
        this.sshOptions = {
            host: connection_config_json_1.default.stand,
            port: connection_config_json_1.default.port,
            username: connection_config_json_1.default.user,
            password: connection_config_json_1.default.password
        };
        this.forwardOptions = {
            srcAddr: '0.0.0.0',
            srcPort: connection_config_json_1.default.port,
            dstAddr: '127.0.0.1',
            dstPort: connection_config_json_1.default.port
        };
    }
    handleError() {
        console.error("MongoDB connection error");
    }
    handleOpen() {
        console.log("MongoDB connection open");
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connection.readyState) {
                console.log("ready state");
                return Promise.resolve(mongoose_1.default);
            }
            if (connection_config_json_1.default.user && connection_config_json_1.default.password) {
                console.log("connecting via ssh");
                return this.connectViaSSH();
            }
            else {
                console.log("connecting via localhost");
                return this.connectLocal();
            }
        });
    }
    connectLocal() {
        return __awaiter(this, void 0, void 0, function* () {
            return mongoose_1.default.connect(connection_config_json_1.default.uri);
        });
    }
    connectViaSSH() {
        return __awaiter(this, void 0, void 0, function* () {
            let [server, conn] = yield (0, tunnel_ssh_1.createTunnel)(this.tunnelOptions, this.serverOptions, this.sshOptions, this.forwardOptions);
            server.on('connection', (conn) => {
                console.log('New SSH connection: ' + conn);
            });
            return this.connectLocal();
        });
    }
}
exports.default = MongoHandler;
//# sourceMappingURL=mongo-handler.js.map