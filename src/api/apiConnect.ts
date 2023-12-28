// @ts-ignore
import cfdb from "cfb.js";
import dotenv from "dotenv"
dotenv.config();


const defaultClient = cfdb.ApiClient.instance;
const ApiKeyAuth = defaultClient.authentications['ApiKeyAuth'];
ApiKeyAuth.apiKey = `Bearer ${process.env.API_KEY}`;


export default cfdb;