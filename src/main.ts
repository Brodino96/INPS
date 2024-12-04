import fastify, { FastifyInstance } from "fastify";
import { SheetsGoogleApi } from "./google";
import { DiscordBot } from "./bot";

class App {
    private httpServer: FastifyInstance;
    public googleSheetApi: SheetsGoogleApi;
    public discordBot: DiscordBot = new DiscordBot();

    constructor() {
        this.httpServer = fastify();
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
            this.googleSheetApi.writeToSheets(detail.text, "invoice")
            .then(()=>{
                this.discordBot.react(detail.message, "🟢")
            })
            .catch(()=>{
                this.discordBot.react(detail.message, "🔴")
            })
        })
        this.discordBot.addEventListener("newBlip", ({detail})=> {
            this.googleSheetApi.writeToSheets(detail.text, "blip")
            .then((e)=>{
                this.discordBot.react(detail.message, "🟢")
            })
            .catch((e)=>{
                this.discordBot.react(detail.message, "🔴")
            })
        })
        await this.httpServer.listen({
            port: 8080,
            host: "0.0.0.0"
        });
    }
}

const app = new App();
app.init();