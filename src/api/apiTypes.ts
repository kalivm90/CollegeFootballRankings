export interface ApiGame {
    id: number;
    season: number;
    week: number;
    seasonType: string;
    startDate: string;
    startTimeTbd: boolean;
    neutralSite: boolean;
    conferenceGame: boolean;
    attendance: number | null;
    venueId: number;
    venue: string;
    homeId: number;
    homeTeam: string;
    homeConference: string;
    homePoints: number;
    homeLineScores: number[];
    homePostWinProb: number | null;
    homePregameElo: number | null;
    homePostgameElo: number | null;
    awayId: number;
    awayTeam: string;
    awayConference: string;
    awayPoints: number;
    awayLineScores: number[];
    awayPostWinProb: number | null;
    awayPregameElo: number | null;
    awayPostgameElo: number | null;
    excitementIndex: number | null;
    highlights: string | null;
    notes: string | null;
}

export interface ApiConference {
    id: number;
    name: string;
    shortName: string;
    abbreviation: string;
    classification: string;
  }
  
