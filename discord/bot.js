// -------------------------------------------------------------------- //

require("dotenv").config()
const { Client, GatewayIntentBits } = require('discord.js')

// -------------------------------------------------------------------- //

const botToken = process.env.DISCORD_TOKEN
const webServerUrl = process.env.WEBSERVER_URL
const fatture_channel = process.env.FATTURE_ID
const blip_channel = process.env.BLIP_ID

// -------------------------------------------------------------------- //

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("ready", () => {
    console.log("Bot è online!")
})

client.on("messageCreate", async (message) => {

    var channel = message.channel.id

    if (channel != fatture_channel & channel != blip_channel ) { return }
    if (message.embeds.length <= 0) { return }

    const embedContent = message.embeds[0].description

    var type = ""
    if (channel == fatture_channel) { type = "fatture" }
    if (channel == blip_channel) { type = "blip" }

    fetch(webServerUrl, {
        method: "POST",
        body: new URLSearchParams({
          "message": embedContent,
          "tableType": type
        })
    })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error("Errore:", error))
})

client.login(botToken)