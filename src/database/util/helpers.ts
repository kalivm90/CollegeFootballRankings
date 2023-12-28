import Conference, {ConferenceDocument} from "../models/conferenceModel";

// Queries division 1 conferences and returns their names in a list 
export async function getConferenceNames(conference: string | null = null): Promise<string[]> {
    
    let conferences: ConferenceDocument[];

    if (conference !== null) {
        conferences = await Conference.find({classification: conference}).select("name").exec();
    } else {
        conferences = await Conference.find().select("name").exec();
    }

    const conferenceNames: string[] = conferences.map((conference: ConferenceDocument) => {
        return conference.name;
    })

    return conferenceNames;
}