import * as net from "net";
import { EventEmitter } from "events";

interface iResponse {
    id: number
    // Define your response interface here
}

interface iRequest {
    id: number;
    filePath: string;
    // Include any other relevant request properties
}

export default class MlHandler extends EventEmitter {
    private readonly url: string;
    private readonly socket: net.Socket;
    private connected: boolean;
    private lastRequestId: number;

    constructor(url: string) {
        super();
        this.url = url;
        this.socket = new net.Socket();
        this.connected = false;
        this.lastRequestId = 0;
    }

    async connect(): Promise<void> {
        if (this.connected) {
            return;
        }
        await new Promise<void>((resolve, reject) => {
            this.socket.connect(this.url, () => {
                this.connected = true;
                resolve();
            });
            this.socket.on("error", (err) => {
                reject(err);
            });
        });
    }

    async postRequest(filePath: string): Promise<iResponse> {
        await this.connect();

        // Construct the request object
        const requestId = ++this.lastRequestId;
        const request: iRequest = {
            id: requestId,
            filePath,
            // Include any other relevant request properties
        };

        // Send the request to the socket
        this.socket.write(JSON.stringify(request));

        // Return a promise that resolves when the response with the correct ID is received
        return new Promise((resolve) => {
            const onResponse = (response: iResponse) => {
                if (response.id === requestId) {
                    this.removeListener("response", onResponse);
                    resolve(response);
                }
            };
            this.on("response", onResponse);
        });
    }

    disconnect(): void {
        if (!this.connected) {
            return;
        }
        this.socket.destroy();
        this.connected = false;
    }

    private handleResponse(data: string): void {
        try {
            const response: iResponse = JSON.parse(data);
            this.emit("response", response);
        } catch (err) {
            console.error(err);
        }
    }

    private handleData(data: Buffer): void {
        let remainingData = data.toString();
        let endIndex = remainingData.indexOf("\n");
        while (endIndex >= 0) {
            const message = remainingData.substring(0, endIndex);
            this.handleResponse(message);
            remainingData = remainingData.substring(endIndex + 1);
            endIndex = remainingData.indexOf("\n");
        }
    }

    private handleError(err: Error): void {
        console.error(err);
        this.disconnect();
    }

    private handleClose(): void {
        this.connected = false;
        this.emit("close");
    }

    start(): void {
        this.socket.on("data", this.handleData.bind(this));
        this.socket.on("error", this.handleError.bind(this));
        this.socket.on("close", this.handleClose.bind(this));
    }
}