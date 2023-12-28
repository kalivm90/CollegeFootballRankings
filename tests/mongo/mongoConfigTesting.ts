import mongoose from "mongoose";
import {MongoMemoryServer} from "mongodb-memory-server";
import cfdb from "../../src/api/apiConnect";
// Collections
import Conference, {ConferenceDocument} from "../../src/database/models/conferenceModel";
import Team, {TeamDocument} from "../../src/database/models/teamModel"
import Game, {GameDocument} from "../../src/database/models/gameModel"
import Rank, {RankDocument} from "../../src/database/models/rankingModel"
// Interfaces
import { ApiGame, ApiConference, ApiTeam } from "../../src/api/apiTypes";
// Util
import { getConferenceNames } from "../../src/database/util/helpers";


class MongoTestServer {
    private mongoServer: MongoMemoryServer | null = null;
    public year: number = 2023;
    
    
    public async start(populate: boolean = false): Promise<void> {
        this.mongoServer = await MongoMemoryServer.create();
        const mongoUri: string = this.mongoServer.getUri();
        mongoose.connect(mongoUri);
    
        mongoose.connection.on("open", async () => {
            console.log("Connection started...")        
        })

        mongoose.connection.on("error", e => {
            if (e.message.code === "ETIMEDOUT") {
                console.error(`Error MongoTestServer: ${e}`);
                mongoose.connect(mongoUri)
            }
            console.error(`Connection Error: ${e}`);
        })

        if (populate) {
            this.populate();
        }
    }

    public async stop(): Promise<void> {
        await mongoose.disconnect();

        if (this.mongoServer) {
            await this.mongoServer.stop();
            console.log("Connection closed...")
        }
    }

    public async populate(): Promise<void> {
        console.log("TODO");
    }
}

export default MongoTestServer;