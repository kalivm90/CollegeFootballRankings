// @ts-ignore
import cfdb from "cfb.js";
// progress bar
import ProgressBar from 'progress';
import dotenv from "dotenv"
dotenv.config();

import MongoDB from "./mongoConfig";

import Conference, {ConferenceDocument} from "./models/conferenceModel";
import Team, { TeamDocument } from "./models/teamModel";
import Game, { GameDocument } from "./models/gameModel";

// Types
import {ApiGame, ApiConference} from "../api/apiTypes";
import { Model } from "mongoose";

// Helpers
import { getConferenceNames } from "./util/helpers";


const defaultClient = cfdb.ApiClient.instance;
const ApiKeyAuth = defaultClient.authentications['ApiKeyAuth'];
ApiKeyAuth.apiKey = `Bearer ${process.env.API_KEY}`;


const year = 2023;

// Enter teams into database
async function enterTeams(): Promise<void> {
    // Initialize api instance
    const TeamsApiInstance = new cfdb.TeamsApi();
    // Response from api
    const teams: TeamDocument[] = await TeamsApiInstance.getTeams(year);
    // Array of d1 conference names
    const conferences: string[] = await getConferenceNames();

    // Teams that are in the FCS/FBS
    const conferenceTeams = teams.filter(team => {
        if (conferences.includes(team.conference)) {
            return team;
        }
    })

    // Progress Bar
    const bar: ProgressBar = new ProgressBar('[:bar] :current/:total teams entered into the database', { total: conferenceTeams.length });

    // Loop through teams and add them to the database
    for (const team of conferenceTeams) {
        if (conferences.includes(team.conference)) {

            const conferenceid: ConferenceDocument | null = await Conference.findOne({name: team.conference}).select("name").exec();

            const newteam: TeamDocument = new Team({
                teamId: team.id,
                school: team.school,
                mascot: team.mascot,
                abbreviation: team.abbreviation,
                conference: conferenceid ? team.conference : null,
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

        }
    }

    console.log("Entered Team into Database...");
}
// Enter conferences into database
async function enterConferences(): Promise<void> {
    const ConferencesApiInstance = new cfdb.ConferencesApi();

    // Get Conferences from API 
    const conferences: ApiConference[] = await ConferencesApiInstance.getConferences();
    // Filter reponse for FCS and FBS conferences
    const divisionOne: ApiConference[] = conferences.filter(conference => conference.classification === "fbs" || conference.classification === "fcs");

    // Progress Bar
    const bar: ProgressBar = new ProgressBar('[:bar] :current/:total teams entered into the database', { total: divisionOne.length });

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
                // Handle the error as needed
            } 
        }

        console.log("Entered Conferences into the database...");
}

async function enterGames(): Promise<void> {
    const GamesApiInstance = new cfdb.GamesApi();

    const opts: Record<string, string | number> = {
        'seasonType': "regular",   
    }

    const games: GameDocument[] = await GamesApiInstance.getGames(year, opts);

    const conferences: string[] = await getConferenceNames();

    const conferenceGames: GameDocument[] = games.filter(game => {
        if (conferences.includes(game.homeConference) && conferences.includes(game.awayConference)) {
            return game;
        }
    })

    const bar: ProgressBar = new ProgressBar('[:bar] :current/:total teams entered into the database', { total: conferenceGames.length });

    
    for (const game of games) {

        const [
            homeTeamDoc,
            awayTeamDoc,
            homeConferenceDoc,
            awayConferenceDoc,
        ] = await Promise.all([
            Team.findOne({ school: game.homeTeam }).exec(),
            Team.findOne({ school: game.awayTeam }).exec(),
            Conference.findOne({ name: game.homeConference }).exec(),
            Conference.findOne({ name: game.awayConference }).exec(),
        ]);

        const homTeamName: TeamDocument | null = homeTeamDoc || null;
        const awayTeamName: TeamDocument | null = awayTeamDoc || null;
        const homeTeamConference: ConferenceDocument | null = homeConferenceDoc || null;
        const awayTeamConference: ConferenceDocument | null = awayConferenceDoc || null;

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
            homeTeam: homTeamName ? game.homeTeam : null,
            homeConference: homeTeamConference ? game.homeConference : null,
            homePoints: game.homePoints,
            homeLineScores: game.homeLineScores,
            homePostWinProb: game.homePostWinProb,
            homePregameElo: game.homePregameElo,
            homePostgameElo: game.homePostgameElo,
            awayId: game.awayId,
            // awayTeam: game.awayTeam,
            // awayConference: game.awayConference,
            awayTeam: awayTeamName ? game.awayTeam : null,
            awayConference: awayTeamConference ? game.awayConference : null,
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

// Checks to see if there is a field in the collection prvided, and if not, enters them in to the database
async function enterCollections(
    document: Model<any>,  
    enterFunction: () => Promise<void>, 
    name: string
): Promise<void> {
    const field = await document.findOne().exec();
    
    if (field === null) {
        await enterFunction()
    } else {
        console.log(`Collection ${name} already exists`)
    }
}

// Main function
async function main(): Promise<void> {
    const mongoDB = process.env.MONGODB_URI

    if (mongoDB !== undefined) {
        const db = new MongoDB(mongoDB);

        await enterCollections(Conference, enterConferences, 'Conferences');
        await enterCollections(Team, enterTeams, 'Teams');
        await enterCollections(Game, enterGames, 'Games');

        await db?.mongoDisconnect();
    }

}

main().catch(e => console.log(e));
