import { Client, Message, TextChannel } from "discord.js-selfbot-v13" // discord bot
import { TypedEventTarget } from 'typescript-event-target';

const fatture_channel: string = process.env.FATTURE_ID!
const blip_channel: string = process.env.BLIP_ID!
const debugDiscord: string = process.env.DEBUG_DISCORD_CHAT!
const infoDiscord: string = process.env.INFO_DISCORD_CHAT!

export interface RichMessage {
    text: string,
    message: Message
}

export interface DiscordEvent {
    newInvoice: CustomEvent<RichMessage>,
    newBlip: CustomEvent<RichMessage>,
}


export class DiscordBot extends TypedEventTarget<DiscordEvent> {
    private client: Client = new Client();

    constructor() {
        super();
        this.client.once("ready", () => {
            console.log("Bot online");
            this.debug("# Bot online")
        })

        this.client.on("messageCreate", async (message) => {
            let channel: string = message.channel.id;
        
            if (channel != fatture_channel && channel != blip_channel ) { return }
            if (message.embeds.length <= 0) { return }
        
            const embedContent = message.embeds[0].description

            if (!embedContent) { return this.info("Il messaggio non conteneva testo embedato") }

            switch (channel) {
                case fatture_channel:
                    this.dispatchTypedEvent("newInvoice", new CustomEvent("newInvoice", {
                        detail: { text: embedContent, message: message }
                    }));
                    break;
                case blip_channel:
                    this.dispatchTypedEvent("newBlip", new CustomEvent("newBlip", {
                        detail: { text: embedContent, message: message }
                    }));
                    break;
                default:
                    this.debug("Ma che cazzo vordi?", embedContent)
            }


        })
    }

    public async login(token: string) {
        await this.client.login(token)
    }

    public async react(message: Message, reaction: string) {
        await message.react(reaction)
    }


    public async debug(...msg: any) {
        await this.getDebugChannel().send(formatConsoleMessage(...msg))
    }

    public async info(...msg: any) {
        this.getInfoDiscord().send(formatConsoleMessage(...msg))
    }

    private getDebugChannel(): TextChannel {
        return this.client.channels.cache.get(debugDiscord) as TextChannel
    }

    private getInfoDiscord(): TextChannel {
        return this.client.channels.cache.get(infoDiscord) as TextChannel
    }
}

function formatConsoleMessage(...msgs): string {
    return msgs.map(msg => {
        if (typeof msg == "string") {
            return msg
        } else {
            return JSON.stringify(msg)
        }
    }).join(", ");
}