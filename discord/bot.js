// -------------------------------------------------------------------- //

require("dotenv").config()

// -------------------------------------------------------------------- //

const { Client, Intents } = require('discord.js')
const axios = require('axios')

// -------------------------------------------------------------------- //

const botToken = process.env.DISCORD_TOKEN
const webServerUrl = process.env.WEBSERVER_URL

// ID dei canali da cui il bot deve leggere i messaggi
const channelId1 = 'CHANNEL_ID_1'; // Sostituisci con l'ID del primo canale
const channelId2 = 'CHANNEL_ID_2'; // Sostituisci con l'ID del secondo canale

// URL del server web dove inviare i messaggi
// Crea una nuova istanza del client Discord
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Evento che si attiva quando il bot è pronto
client.once('ready', () => {
    console.log('Bot è online!');
});

// Evento che si attiva quando il bot riceve un messaggio
client.on('messageCreate', async (message) => {
    // Controlla se il messaggio proviene dai canali che ci interessano
    if (message.channel.id === channelId1 || message.channel.id === channelId2) {
        // Verifica se il messaggio è embeddato
        if (message.embeds.length > 0) {
            // Estrai il contenuto dell'embed (qui assumiamo che il contenuto sia nel campo "description")
            const embedContent = message.embeds[0].description;

            // Invia il contenuto al web server
            try {
                const response = await axios.post(webServerUrl, {
                    content: embedContent
                });
                console.log('Messaggio inviato al server:', response.data);
            } catch (error) {
                console.error('Errore nell\'invio al server:', error);
            }
        }
    }
});

// Effettua il login del bot
client.login(botToken);
