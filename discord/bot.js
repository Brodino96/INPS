// -------------------------------------------------------------------- //

require("dotenv").config() // Keep your info secured
const { Client, GatewayIntentBits } = require("discord.js") // discord bot
const axios = require("axios") // better http posts
const http = require("http") // webserver

// -------------------------------------------------------------------- //

const botToken = process.env.DISCORD_TOKEN
const webServerUrl = process.env.WEBSERVER_URL
const fatture_channel = process.env.FATTURE_ID
const blip_channel = process.env.BLIP_ID
const debugDiscordChat = process.env.DEBUG_DISCORD_CHAT

// -------------------------------------------------------------------- //

const host = "localhost"
const port = 8000

// -------------------------------------------------------------------- //

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.once("ready", () => {
    client.channels.cache.get(debugDiscordChat).send("# Bot online!")
    console.log("Bot online!")

    deployWebserver()
})

client.on("messageCreate", async (message) => {

    console.log(`Message detected`)

    var channel = message.channel.id

    if (channel != fatture_channel & channel != blip_channel ) { return }
    if (message.embeds.length <= 0) { return }

    const embedContent = message.embeds[0].description

    var type = ""
    if (channel == fatture_channel) { type = "fatture" }
    if (channel == blip_channel) { type = "blip" }
    console.log(`The message is of type: ${type}`)

    axios.post(webServerUrl, { message: embedContent, tableType: type})
    .then(response => console.log(response))
    .catch(function (error) {
        /*
        client.channels.cache.get(debugDiscordChat).send(
            `# ATTENZIONE\n## Si è verificato un errore con l'aggiunta di:\n\`${embedContent}\`\nall'interno della Google Sheet\n\`${error}\`\n<@299559814504251394>`
        )
        */
       console.log(`Error: ${error}`)
       client.channels.cache.get(debugDiscordChat).send(
           `# PORCODDIO\n## <@299559814504251394> SVEGLIATE CHE SI E' ROTTO QUALCOSA\n\`${embedContent}\`\nNON E' ARRIVATO SU GOOGLE SHEET\n\`${error}\``
       )
    })
})

client.login(botToken)

async function deployWebserver () {

    const requestListener = function (req, res) {
        res.writeHead(200)
        res.end("My first server!")
    }

    const server = http.createServer(requestListener);
    server.listen(port, host, () => {
        console.log(`Server is running on http://${host}:${port}`);
    })
}