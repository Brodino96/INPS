// -------------------------------------------------------------------- //

import { google, type sheets_v4 } from "googleapis"
import fs from "fs/promises"
import {FastifyInstance} from "fastify";
import { type OAuth2Client } from "google-auth-library"

// -------------------------------------------------------------------- //

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
const TOKEN_PATH = "auth/token.json"

// -------------------------------------------------------------------- //

class AuthenticatedGoogleApi {
    private httpServer: FastifyInstance;
    protected oauth2Client: OAuth2Client;

    constructor (httpServer: FastifyInstance) {
        this.httpServer = httpServer;
        this.oauth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.URL + "/outh_callback",
        );
    }

    private async authWithToken() {
        const token = await fs.readFile(TOKEN_PATH, "utf-8");
        this.oauth2Client.setCredentials(JSON.parse(token));
    }
    
    private async initAuthServer() {
        console.log("Token file not found, logging in")
        this.httpServer.get("/auth_google", async (request, reply) => {
            const authUrl = this.oauth2Client.generateAuthUrl({
                access_type: "offline",
                scope: SCOPES,
            })
            reply.redirect(authUrl)
        })

        console.log(`Please go to ${process.env.URL}/auth_google`)

        this.httpServer.get("/outh_callback", async (request, reply) => {
            const code = request.query!["code"];

            const { tokens } = await this.oauth2Client.getToken(code)
            this.oauth2Client.setCredentials(tokens)
            await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens))

            reply.code(200).send("Logged in!")
        })
    }

    public async authorize() {
        // @ts-ignore
        if (await fs.exists(TOKEN_PATH)) {
            await this.authWithToken();
        } else {
            await this.initAuthServer();
        }
    }
}

export class SheetsGoogleApi extends AuthenticatedGoogleApi {
    private sheet: sheets_v4.Sheets;

    override async authorize() {
        super.authorize();
        this.sheet = google.sheets({
            version: "v4",
            auth: this.oauth2Client
        })
    }

    public async writeToSheets(message: string, type: string) {
        const currentDate = new Date().toISOString().split('T')[0]
        let regex: RegExp
    
        if (type === "invoice") {
    
            regex = /(.*?) ha pagato una fattura di ([\d.]+)\$ del giorno (\d{2}\/\d{2}\/\d{4}) \| (\d{2}:\d{2})/
            const match = message.match(regex)
    
            if (!match) { 
                throw `# Errore\nMessaggio non valido per la tabella "fatture": \`${message}\``;
            }
    
            const [_, name, price, , time] = match
            const adjustedPrice = price.replaceAll(".", ",")
            const values = [[name, currentDate, time, adjustedPrice]]
    
            try {
                await this.sheet.spreadsheets.values.append({
                    spreadsheetId: process.env.SPREADSHEET_ID,
                    range: "INPS!I3:L3",
                    valueInputOption: "USER_ENTERED",
                    insertDataOption: "INSERT_ROWS",
                    responseValueRenderOption: "FORMATTED_VALUE",
                    responseDateTimeRenderOption: "RAW",
                    requestBody: {
                        values: values,
                    },
                }, {})
        
                console.log("Dati aggiunti correttamente!");
            } catch (error) {
                console.error("Errore durante l'inserimento dei dati:", error);
            }
    
        } else if (type === "blip") {
            
            regex = /Hanno comprato (\d+)x di (.*?) per ([\d.]+)\$/
            const match = message.match(regex)
    
            if (!match) { 
                throw `# Errore\nMessaggio non valido per la tabella "blip": \`${message}\``;
            }
    
            const [_, quantity, item, price] = match
            const adjustedPrice = price.replaceAll(".", ",")
            const values = [[ quantity, item, currentDate, adjustedPrice]]
            console.log(values)
    
            try {
                await this.sheet.spreadsheets.values.append({
                    spreadsheetId: process.env.SPREADSHEET_ID,
                    range: "INPS!N3:Q3",
                    valueInputOption: "USER_ENTERED",
                    insertDataOption: "INSERT_ROWS",
                    responseValueRenderOption: "RAW",
                    requestBody: {
                        values: values,
                    },
                }, {});
        
                console.log("Dati aggiunti correttamente!")
            } catch (error) {
                console.error("Errore durante l'inserimento dei dati:", error)
            }
        }
    }

}