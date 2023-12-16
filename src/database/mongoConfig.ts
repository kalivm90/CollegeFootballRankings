import mongoose, {Connection, mongo} from "mongoose";

class MongoDB {
    private uri: string

    constructor (uri: string) {
        this.uri = uri
        this._mongoInit().catch(e => console.log(e));
    }

    private async _mongoInit(): Promise<void> {
        await mongoose.connect(this.uri);
        console.log("MongoBD connected...");
    }

    public async mongoDisconnect(): Promise<void> {
        await mongoose.disconnect();
        console.log("MongoDB disconnected...");
    }
}

export default MongoDB;