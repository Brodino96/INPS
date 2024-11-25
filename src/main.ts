import fastify, { FastifyInstance } from "fastify";
import { SheetsGoogleApi } from "./google";
import { DiscordBot } from "./bot";

class App {
    private httpServer: FastifyInstance;
    public googleSheetApi: SheetsGoogleApi;
    public discordBot: DiscordBot = new DiscordBot();

    constructor() {
        this.httpServer = fastify({
            logger: true   
        });
        this.googleSheetApi = new SheetsGoogleApi(this.httpServer);
    }

    private async authenticate() {
        await Promise.all([
            this.googleSheetApi.authorize(),
            this.discordBot.login(process.env.DISCORD_TOKEN as string)
        ])
    }

    public async init() {
        await this.authenticate();
        this.discordBot.addEventListener("newInvoice", ({detail})=>{
            this.googleSheetApi.writeToSheets(detail, "invoice")
        })
        this.discordBot.addEventListener("newBlip", ({detail})=> {
            this.googleSheetApi.writeToSheets(detail, "blip")
        })
    }
}

const app = new App();
app.init();