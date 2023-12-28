import cfdb from '../api/apiConnect';
// progress bar
import ProgressBar from 'progress';

import MongoDB from "./mongoConfig";

import Conference, { ConferenceDocument } from "./models/conferenceModel";
import Team, { TeamDocument } from "./models/teamModel";
import Game, { GameDocument } from "./models/gameModel";
import Rank, { RankDocument } from "./models/rankingModel";

// Types
import {ApiGame, ApiConference, ApiTeam} from "../api/apiTypes";
import { Model } from "mongoose";

// Helpers
import { getConferenceNames } from "./util/helpers";


const year = 2023;

// insert teams into database
async function insertTeams(): Promise<void> {
    // Initialize api instance
    const TeamsApiInstance = new cfdb.TeamsApi();
    // Response from api
    const teams: ApiTeam[] = await TeamsApiInstance.getTeams(year);
    // Array of d1 conference names
    const conferences: string[] = await getConferenceNames();

    // Teams that are in the FCS/FBS
    const conferenceTeams = teams.filter(team => {
        if (conferences.includes(team.conference)) {
            return team;
        }
    })

    // Progress Bar
    const bar: ProgressBar = new ProgressBar('[:bar] :current/:total teams inserted into the database', { total: conferenceTeams.length });


    // Loop through teams and add them to the database
    for (const team of conferenceTeams) {
        if (conferences.includes(team.conference)) {

            const conferenceid: ConferenceDocument | null = await Conference.findOne({name: team.conference}).select("_id").exec();

            if (conferenceid) {
                const newteam: TeamDocument = new Team({
                    teamId: team.id,
                    school: team.school,
                    mascot: team.mascot,
                    abbreviation: team.abbreviation,
                    conference: conferenceid,
                    color: team.color,
                    altColor: team.altColor,
                    logos: team.logos,
                    location: {
                        venueId: team.location.venue_id,
                        name: team.location.name,
                        city: team.location.city,
                        state: team.location.state,
                        zip: team.location.zip,
                        countryCode: team.location.country_code,
                        timezone: team.location.timezone,
                        latitude: team.location.latitude,
                        longitude: team.location.longitude,
                        elevation: team.location.elevation,
                        capacity: team.location.capacity,
                        yearConstructed: team.location.year_constructed,
                        grass: team.location.grass,
                        dome: team.location.dome
                    }
                });

                try {
                    await newteam.save();
                    bar.tick();
                } catch (e) {
                    console.error(`Error saving team ${newteam.school}: ${e}`);
                }
            } else {
                console.log(`Error: Conference for team: ${team.school} not found`);
            }
        }
    }
}
// insert conferences into database (export for testing server)
async function insertConferences(): Promise<void> {
    const ConferencesApiInstance = new cfdb.ConferencesApi();

    // Get Conferences from API 
    const conferences: ApiConference[] = await ConferencesApiInstance.getConferences();
    // Filter reponse for FCS and FBS conferences
    const divisionOne: ApiConference[] = conferences.filter(conference => conference.classification === "fbs" || conference.classification === "fcs");

    // Progress Bar
    const bar: ProgressBar = new ProgressBar('[:bar] :current/:total teams inserted into the database', { total: divisionOne.length });

    // Loop through divisionOne and save each conference to the database
    for (const conference of divisionOne) {
        const newConference = new Conference({
            conferenceId: conference.id,
            name: conference.name,
            shortName: conference.shortName,
            abbreviation: conference.abbreviation,
            classification: conference.classification,
        });

        try {
            // Save the new conference to the database
            await newConference.save();
            bar.tick();
        } catch (error) {
            console.error(`Error saving conference ${newConference.name}: ${error}`);
        } 
    }
}

async function insertGames(): Promise<void> {
    const GamesApiInstance = new cfdb.GamesApi();

    const opts: Record<string, string | number> = {
        'seasonType': "regular",   
    }

    const games: ApiGame[] = await GamesApiInstance.getGames(year); // insert any opts as 2nd argument to getGames();

    const conferences: string[] = await getConferenceNames();

    const conferenceGames: ApiGame[] = games.filter(game => {
        if (conferences.includes(game.homeConference) && conferences.includes(game.awayConference)) {
            return game;
        }
    })

    const bar: ProgressBar = new ProgressBar('[:bar] :current/:total games inserted into the database', { total: conferenceGames.length });

    
    for (const game of conferenceGames) {

        const [
            homeTeamDoc,
            awayTeamDoc,
            homeConferenceDoc,
            awayConferenceDoc,
        ] = await Promise.all([
            Team.findOne({ school: game.homeTeam }).select("_id").exec(),
            Team.findOne({ school: game.awayTeam }).select("_id").exec(),
            Conference.findOne({ name: game.homeConference }).select("_id").exec(),
            Conference.findOne({ name: game.awayConference }).select("_id").exec(),
        ]);

        const homTeamName: TeamDocument | null = homeTeamDoc?._id || null;
        const awayTeamName: TeamDocument | null = awayTeamDoc?._id || null;
        const homeTeamConference: ConferenceDocument | null = homeConferenceDoc?._id || null;
        const awayTeamConference: ConferenceDocument | null = awayConferenceDoc?._id || null;


        const newgame: GameDocument = new Game({
            gameId: game.id,
            season: game.season,
            week: game.week,
            seasonType: game.seasonType,
            startDate: game.startDate,
            startTimeTbd: game.startTimeTbd,
            neutralSite: game.neutralSite,
            conferenceGame: game.conferenceGame,
            attendance: game.attendance,
            venueId: game.venueId,
            venue: game.venue,
            homeId: game.homeId,
            // homeTeam: game.homeTeam,
            // homeConference: game.homeConference,
            homeTeam: homTeamName,
            homeConference: homeTeamConference,
            homePoints: game.homePoints,
            homeLineScores: game.homeLineScores,
            homePostWinProb: game.homePostWinProb,
            homePregameElo: game.homePregameElo,
            homePostgameElo: game.homePostgameElo,
            awayId: game.awayId,
            // awayTeam: game.awayTeam,
            // awayConference: game.awayConference,
            awayTeam: awayTeamName,
            awayConference: awayTeamConference,
            awayPoints: game.awayPoints,
            awayLineScores: game.awayLineScores,
            awayPostWinProb: game.awayPostWinProb,
            awayPregameElo: game.awayPregameElo,
            awayPostgameElo: game.awayPostgameElo,
            excitementIndex: game.excitementIndex,
            highlights: game.highlights,
            notes: game.notes,
        })

        try {
            await newgame.save();
            bar.tick();
        } catch (e) {
            console.error(`Error saving game ${game.id}: ${e}`);
        }
    }
}

async function insertRankings(): Promise<void> {
    const RankingsApiInstance = new cfdb.RankingsApi();

    const opts: Record<string, string | number> = {
        "seasonType": 'regular',
    }

    const rankings: RankDocument[] = await RankingsApiInstance.getRankings(year);

    const bar: ProgressBar = new ProgressBar('[:bar] :current/:total rankings inserted into the database', { total: rankings.length });

    // List of relevant polls
    const pollsOpts: string[] = [
        "AP Top 25",
        "Playoff Committee Rankings"
    ]

    for (const rank of rankings) {
        const newrank: RankDocument = new Rank({
            season: rank.season,
            seasonType: rank.seasonType,
            week: rank.week,
            polls: await Promise.all(
                rank.polls
                    .filter(i => pollsOpts.includes(i.poll))
                    .map(async (filteredPoll) => ({
                        poll: filteredPoll.poll,
                        ranks: (
                            await Promise.all(
                                filteredPoll.ranks.map(async (rankItem) => {
                                    const schoolname = await Team.findOne({ school: rankItem.school }).select("_id");
                                    // A FCS team would probably never be ranked, at least not in the 2023 season.
                                    const conference = await Conference.findOne({name: rankItem.conference, classification: "fbs"});
                                    
                                    if (schoolname !== null && conference !== null) {
                                        return {
                                            rank: rankItem.rank,
                                            school: schoolname._id,
                                            conference: conference._id,
                                            firstPlaceVotes: rankItem.firstPlaceVotes,
                                            points: rankItem.points,
                                        };
                                    }
        
                                    return null;
                                })
                            )
                        ).filter(Boolean),
                    }))
            )
        });
        
        try {
            await newrank.save();
            bar.tick();
        } catch(e) {
            console.error(`Error saving rank ${rank.id}: ${e}`);
        }
    }

    // console.log(rankings[0].polls[0])
}


// Checks to see if there is a field in the collection already, and if not, calls the callback to the insertFunction
async function insertCollections (
    document: Model<any>,
    // This argument queries the API and inserts it into the db
    insertCallback: () => Promise<void>
): Promise<void> {
    const collectionName = document.collection.name;

    const field = await document.findOne().exec();

    if (field === null) {
        await insertCallback();
    } else {
        console.log(`Collection ${collectionName} already exists`);
    }
}

// Populates the database with the array of collection names, if the array is empty all collections are inserted
export default async function populate(collectionNames: string[]): Promise<void> {

    // interface for collections object
    interface ICollectionEntry {
        model: Model<any>,
        insertFunc: () => Promise<void>;
    }

    // Binds model and insert function to collection name  
    const collections: Record<string, ICollectionEntry> = {
        "conferences": {
            "model": Conference,
            "insertFunc": insertConferences,
        },
        "teams": {
            "model": Team,
            "insertFunc": insertTeams,
        },
        "games": {
            "model": Game,
            "insertFunc": insertGames,
        },
        "ranks": {
            "model": Rank,
            "insertFunc": insertRankings,
        }
    };

    // if collectionNames = [] insert all collections
    if (collectionNames.length === 0) {
        await insertCollections(collections["conferences"].model, collections["conferences"].insertFunc);
        await insertCollections(collections["teams"].model, collections["teams"].insertFunc);
        await insertCollections(collections["games"].model, collections["games"].insertFunc);
        await insertCollections(collections["ranks"].model, collections["ranks"].insertFunc);
        return;
    }

    // Loop through every collection name and insert them consecutively since some of them rely on relations from previous
    for (const collectionName of collectionNames) {
        const collection = collections[collectionName.toLowerCase()];

        if (collection) {
            await insertCollections(collection.model, collection.insertFunc);
        } else {
            console.error(`populatedb([collectionNames]): Invalid collection name: ${collectionName}`);
        }
    }
}


// Main function - being exported to use in unit tests
async function main(): Promise<void> {

    const mongoDB: string | undefined = process.env.MONGODB_URI

    if (mongoDB !== undefined) {
        const db = new MongoDB(mongoDB);
        console.log("Connected to database...");
        await populate([]);
        await db?.mongoDisconnect();
    }

}

export {
    insertCollections,
    populate,
    insertConferences,
    insertRankings,
}



if (require.main === module) {
    main().catch(e => console.error(`populatedb.ts main(): ${e}`));
}

