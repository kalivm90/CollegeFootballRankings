import mongoose, {Schema, Document} from "mongoose";

export interface TeamDocument extends Document {
    teamId: number,
    school: string,
    mascot?: string,
    abbreviation: string,
    conference: string, 
    color?: string,
    altColor?: string
    logos?: string[],
    location: ILocation,
}

export interface ILocation {
    venue_id?: number,
    name?: string,
    city?: string,
    state?: string,
    zip?: string,
    country_code?: string,
    timezone?: string,
    latitude?: number,
    longitude?: number,
    elevation?: string,
    capacity?: number,
    year_constructed?: number,
    grass: boolean,
    dome: boolean,
}

const TeamModel: Schema<TeamDocument> = new Schema({
    teamId: {type: Number, unique: true},
    school: String,
    mascot: String,
    abbreviation: String,
    conference: String, 
    color: String,
    altColor: String,
    logos: [String],
    location: {
        venue_id: Number,
        name: String,
        city: String,
        state: String,
        zip: String,
        country_code: String,
        timezone: String,
        latitude: Number,
        elevation: String,
        capacity: Number,
        year_constructed: Number,
        grass: Boolean,
        dome: Boolean,
    }
})


const Team = mongoose.model<TeamDocument>('Team', TeamModel);

export default Team;