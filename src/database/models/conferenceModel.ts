import mongoose, {Schema, Document} from "mongoose";

export interface ConferenceDocument extends Document {
    conferenceId: number;
    name: string;
    shortName: string;
    abbreviation: string;
    classification: string;
}


const ConferenceModel: Schema<ConferenceDocument> = new Schema({
    conferenceId: {type: Number, unique: true},
    name: String,
    shortName: String,
    abbreviation: String,
    classification: String,
})


const Conference = mongoose.model("Conference", ConferenceModel);

export default Conference;