// -------------------------------------------------------------------- //

import {Client, GatewayIntentBits} from "discord.js" // discord bot
import axios from "axios"
import Fastify from "fastify"

// -------------------------------------------------------------------- //

const botToken = process.env.DISCORD_TOKEN
const webServerUrl = process.env.WEBSERVER_URL
const fatture_channel = process.env.FATTURE_ID
const blip_channel = process.env.BLIP_ID
const debugDiscord = process.env.DEBUG_DISCORD_CHAT
const infoDiscord = process.env.INFO_DISCORD_CHAT

// -------------------------------------------------------------------- //

let Notify

// -------------------------------------------------------------------- //

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
})

client.once("ready", () => {
    console.log("Bot online")
    client.channels.cache.get(debugDiscord).send("# Bot online!")

    deployNotifier()

    deployWebserver()
})

client.on("messageCreate", async (message) => {

    let channel = message.channel.id

    if (channel != fatture_channel & channel != blip_channel ) { return }
    if (message.embeds.length <= 0) { return }

    const embedContent = message.embeds[0].description

    let type
    if (channel == fatture_channel) { type = "fatture" }
    if (channel == blip_channel) { type = "blip" }
    console.log(`The message is of type: ${type}`)

    axios.post(webServerUrl, { message: embedContent, tableType: type})
    .then(response => console.log(response))
    .catch(function (error) {
        /*
        client.channels.cache.get(debugDiscordChat).send(
            `# ATTENZIONE\n## Si è verificato un errore con l'aggiunta di:\n\`${embedContent}\`\nall'interno della Google Sheet\n\`${error}\`\n<@299559814504251394>`
        ) */
       Notify.debug(`# PORCODDIO\n## <@299559814504251394> SVEGLIATE CHE SI E' ROTTO QUALCOSA\n\`${embedContent}\`\nNON E' ARRIVATO SU GOOGLE SHEET\n\`${error}\``)
       Notify.info(`# PORCODDIO\n## <@299559814504251394> SVEGLIATE CHE SI E' ROTTO QUALCOSA\n\`${embedContent}\`\nNON E' ARRIVATO SU GOOGLE SHEET\n\`${error}\``)
    })
})

client.login(botToken)

async function deployWebserver () {

    const fastify = Fastify({ logger: false })

    fastify.post("/", async (request, reply) => {
        try {
            const { message } = request.body
            if (!message) {
                return reply.status(400).send({ error: "Message is required" })
            }
            Notify.debug(message)
            reply.send({ status: "success" })

        } catch (error) {
            reply.status(500).send({ error: "An error occurred" })
        }
    })

    try {
        await fastify.listen({ port: 8080 })
    } catch (err) {
        Notify.debug(JSON.stringify(err))
        fastify.log.error(err)
        process.exit(1)
    }
}

function deployNotifier() {
    Notify = {
        async debug(msg) {
            client.channels.cache.get(debugDiscord).send(msg)
            console.log(msg)
        },
        async info(msg) {
            client.channels.cache.get(infoDiscord).send(msg)
            console.log(msg)
        }
    }
}