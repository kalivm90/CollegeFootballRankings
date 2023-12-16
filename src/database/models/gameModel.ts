import mongoose, {Document, Schema} from "mongoose";

export interface GameDocument extends Document {
    teamId: number;
    season: number;
    week: number;
    seasonType: string;
    startDate: Date;
    startTimeTbd: boolean;
    neutralSite: boolean;
    conferenceGame: boolean;
    attendance?: number;
    venueId?: number;
    venue: string;
    homeId: number;
    homeTeam: string;
    homeConference: string;
    homePoints: number;
    homeLineScores: number[];
    homePostWinProb?: number;
    homePregameElo?: number;
    homePostgameElo?: number;
    awayId: number;
    awayTeam: string;
    awayConference: string;
    awayPoints: number;
    awayLineScores: number[];
    awayPostWinProb?: number;
    awayPregameElo?: number;
    awayPostgameElo?: number;
    excitementIndex?: number;
    highlights?: string;
    notes?: string;
  }
  
  const GameModel: Schema<GameDocument> = new Schema<GameDocument>({
    teamId: { type: Number },
    season: { type: Number },
    week: { type: Number },
    seasonType: { type: String },
    startDate: { type: Date },
    startTimeTbd: { type: Boolean },
    neutralSite: { type: Boolean },
    conferenceGame: { type: Boolean },
    attendance: { type: Number },
    venueId: { type: Number },
    venue: { type: String },
    homeId: { type: Number },
    homeTeam: { type: String },
    homeConference: { type: String },
    homePoints: { type: Number },
    homeLineScores: { type: [Number] },
    homePostWinProb: { type: Number },
    homePregameElo: { type: Number },
    homePostgameElo: { type: Number },
    awayId: { type: Number },
    awayTeam: { type: String },
    awayConference: { type: String },
    awayPoints: { type: Number },
    awayLineScores: { type: [Number] },
    awayPostWinProb: { type: Number },
    awayPregameElo: { type: Number },
    awayPostgameElo: { type: Number },
    excitementIndex: { type: Number },
    highlights: { type: String },
    notes: { type: String },
  });

  const Game = mongoose.model("Game", GameModel);

  export default Game;