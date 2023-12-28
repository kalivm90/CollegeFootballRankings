import mongoose, {Document, Schema} from "mongoose";

export interface RankDocument extends Document {
    season: number,
    seasonType: string, 
    week: number,
    polls: [IPoll]
}

interface IPoll {
    poll: string,
    ranks: [IRank]
}

interface IRank {
    rank: number,
    school: mongoose.Types.ObjectId,
    conference: mongoose.Types.ObjectId,
    firstPlaceVotes: number,
    points: number,
}

const RankingSchema: Schema<RankDocument> = new Schema({
    season: {type: Number},
    seasonType: {type: String},
    week: {type: Number},
    polls: [
        {
            poll: {type: String},
            ranks: [
                {
                    rank: {type: Number},
                    school: {type: mongoose.Types.ObjectId, ref: "Team"},
                    conference: {type: mongoose.Types.ObjectId, ref: "Conference"},
                    firstPlaceVotes: {type: Number},
                    points: {type: Number}
                }
            ]
        }
    ]
}) 

const Rank = mongoose.model("Rank", RankingSchema);

export default Rank;