import { Client, TextChannel } from "discord.js-selfbot-v13" // discord bot
import { TypedEventTarget } from 'typescript-event-target';

const webServerUrl: string = process.env.WEBSERVER_URL!
const fatture_channel: string = process.env.FATTURE_ID!
const blip_channel: string = process.env.BLIP_ID!
const debugDiscord: string = process.env.DEBUG_DISCORD_CHAT!
const infoDiscord: string = process.env.INFO_DISCORD_CHAT!

export interface DiscordEvent {
    newInvoice: CustomEvent<string>,
    newBlip: CustomEvent<string>
}

export class DiscordBot extends TypedEventTarget<DiscordEvent> {
    private client: Client = new Client();

    constructor() {
        super();
        this.client.once("ready", () => {
            console.log("Bot online");
            this.debug("# Bot online porco di dio")
        })

        this.client.on("messageCreate", async (message) => {
            let channel: string = message.channel.id
        
            if (channel != fatture_channel && channel != blip_channel ) { return }
            if (message.embeds.length <= 0) { return }
        
            const embedContent = message.embeds[0].description

            switch (channel) {
                case fatture_channel:
                    this.dispatchTypedEvent('newInvoice', new CustomEvent('newInvoice', {
                        detail: embedContent!
                    }));
                    break;
                case blip_channel:
                    this.dispatchTypedEvent('newBlip', new CustomEvent('newBlip', {
                        detail: embedContent!
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


    public async debug(...msg) {
        await this.getDebugChannel().send(formatConsoleMessage(...msg))
    }

    public async info(...msg) {
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