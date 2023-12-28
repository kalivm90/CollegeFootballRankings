import jest from "jest";
import MongoTestServer from "../mongo/mongoConfigTesting";
import cfdb from "../../src/api/apiConnect";
// Collections
import Conference, {ConferenceDocument} from "../../src/database/models/conferenceModel";
import Team, {TeamDocument} from "../../src/database/models/teamModel"
import Game, {GameDocument} from "../../src/database/models/gameModel"
import Rank, {RankDocument} from "../../src/database/models/rankingModel"
// Interfaces
import { ApiGame, ApiConference, ApiTeam } from "../../src/api/apiTypes";
// Progress Bar
import ProgressBar from 'progress';
// Populate Functions
import populatedb from "../../src/database/populatedb";


let db: any;
const api = cfdb;

const year = 2023;


describe("Test the way information is recieved from the API and entered into the database", () => {

    beforeAll(async () => {
        db = new MongoTestServer();
        await db.start();
        await populatedb(["Conferences", "Ranks"]).catch(e => console.log(e));
    })
    
    afterAll(async () => {
        await db.stop()
    })

    test("test for valid api connection by checking for response", async () => {
        // Initiate instance 
        const RankingsApiInstance = new cfdb.RankingsApi();
        // Set options
        const opts: Record<string, string | number> = {
            "week": 1,
        }
        
        try {
            // Request rankings
            const rankings: RankDocument[] = await RankingsApiInstance.getRankings(year, opts);
            // Check for response
            expect(rankings).toBeTruthy();
        } catch (e) {
            // Error if failed
            // fail(`API connection failed with error ${e}`)
            throw new Error(`API connection failed with error ${e}`)
            // console.log(e);
        }
    })


    test("should enter conferences into the database using the main function", async () => {
        try {
            const validConference: ConferenceDocument | null = await Conference.findOne().exec();
            expect(validConference).toBeTruthy();
        } catch (e) {
            throw new Error(`Error inserting Conferences ${e}`)
            // console.log(e);
        }
    });

})