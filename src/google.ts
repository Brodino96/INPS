import { google } from "googleapis"
import fs from "fs/promises"
import path from "path"
import readline from "readline"
import Fastify from "fastify"
import open from "open"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
const TOKEN_PATH = "token.json"

const fastify = Fastify({ logger: false })

async function authorize() {
    const oAuth2Client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.URL + "/outh_callback",
    )

    if (await fs.exists(TOKEN_PATH)) {
        console.log("Token file found, logging in")
        const token = await fs.readFile(TOKEN_PATH, "utf-8")
        oAuth2Client.setCredentials(JSON.parse(token))
    } else {
        console.log("Token file not found, logging in")
        fastify.get("/auth_google", async (request, reply) => {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: "offline",
            scope: SCOPES,
        })
        reply.redirect(authUrl)
        })
        await new Promise((resolve) => {
        fastify.get("/outh_callback", async (request, reply) => {
            const code = request.query.code

            const { tokens } = await oAuth2Client.getToken(code)
            oAuth2Client.setCredentials(tokens)
            await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens))

            reply.code(200).send("Logged in!")
            resolve()
        })
        })
        console.log(`Please go to ${process.env.URL}/auth_google`)
    }

    return oAuth2Client
}

async function main() {
    const auth = await authorize()
    let sheets = google.sheets({
        version: "v4",
        auth,
    })

    await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: "Foglio1!B3:C4",
        valueInputOption: "RAW",
        resource: {
        values: [
            ["B3", "C4"],
            ["B3", new Date()],
        ],
        },
    })
}

try {
    await fastify.listen({ port: 8080 })
    await main()
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}
