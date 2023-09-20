import config from "../util/conf/connection-config.json"
import {EventEmitter} from "events";
import mongoose from "mongoose";
import Console from "console";
import {createTunnel} from "tunnel-ssh";

export default class MongoHandler {
    private connection = mongoose.connection
    private readonly tunnelOptions
    private readonly serverOptions
    private readonly sshOptions
    private readonly forwardOptions
    private static _instance: MongoHandler

    public static getInstance() {
        return this._instance || (this._instance = new MongoHandler())
    }

    constructor() {
        this.connection.on('error', this.handleError.bind(this))
        this.connection.once('open', this.handleOpen.bind(this))

        this.tunnelOptions = {
            autoClose: true
        }

        this.serverOptions = {
            port: config.port
        }

        this.sshOptions = {
            host: config.stand,
            port: config.port,
            username: config.user,
            password: config.password
        }

        this.forwardOptions = {
            srcAddr: '0.0.0.0',
            srcPort: config.port,
            dstAddr: '127.0.0.1',
            dstPort: config.port
        }
    }

    private handleError() {
        console.error("MongoDB connection error")
    }

    private handleOpen() {
        console.log("MongoDB connection open")
    }
    public async connect(){
        if (this.connection.readyState) {
            console.log("ready state")
            return Promise.resolve(mongoose)
        }
        if (config.user && config.password) {
            console.log("connecting via ssh")
            return this.connectViaSSH()
        } else {
            console.log("connecting via localhost")
            return this.connectLocal()
        }
    }

    private async connectLocal() {
        return mongoose.connect(
            config.uri
        );
    }

    private async connectViaSSH() {
        let [server, conn] = await createTunnel(
            this.tunnelOptions,
            this.serverOptions,
            this.sshOptions,
            this.forwardOptions
        )
        server.on('connection', (conn) => {
            console.log('New SSH connection: ' + conn)
        })
        return this.connectLocal()
    }
}