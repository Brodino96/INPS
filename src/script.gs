const botWebserverUrl = ""
const initialRow = 3
const firstTable = [9, 10, 11, 12] // Colonne I, J, K, L
const secondTable = [14, 15, 16, 17] // Colonne N, O, P, Q

function doGet(e) { // Webserver is created
    return HtmlService.createHtmlOutput("Web app attiva!")
}

function doPost(e) { // When the webserver recives a message
    let message = e.parameter.message
    let tableType = e.parameter.tableType
  
    if (message && tableType) {
        addData(message, tableType)
        ContentService.createTextOutput("Dati aggiunti correttamente!")
    } else {
        sendDiscordMessage(`# Errore\nIl webserver non ha ricevuto i parametri correttamente\nContenuti: \`${message, tableType}\``)
    }
}

async function addData(message, tableType) {

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("INPS")
    const currentDate = new Date()

    if (tableType === "fatture") {
        
        const regex = /(.*?) ha pagato una fattura di ([\d.]+)\$ del giorno (\d{2}\/\d{2}\/\d{4}) \| (\d{2}:\d{2})/
        const match = message.match(regex)

        if (!match) { return sendDiscordMessage(`# Errore\nMessaggio non valido per la tabella "fatture": \`${message}\``) }
        
        const [_, persona, denaro, , ora] = match
    
        let lastRow = initialRow
        while (sheet.getRange(lastRow, firstTable[0]).getValue() !== "") {
            lastRow++
        }
        
        sheet.getRange(lastRow, firstTable[0]).setValue(persona)
        sheet.getRange(lastRow, firstTable[1]).setValue(currentDate)
        sheet.getRange(lastRow, firstTable[2]).setValue(ora)
        sheet.getRange(lastRow, firstTable[3]).setValue(parseFloat(denaro))


    } else if (tableType === "blip") {
        
        const regex = /Hanno comprato (\d+)x di (.*?) per ([\d.]+)\$/
        const match = message.match(regex)

        if (!match) { return sendDiscordMessage(`# Errore\nMessaggio non valido per la tabella "blip": \`${message}\``) }

        const [_, quantita, oggetto, denaro] = match

        let lastRow = initialRow
        while (sheet.getRange(lastRow, secondTable[0]).getValue() !== "") {
            lastRow++
        }

        sheet.getRange(lastRow, secondTable[0]).setValue(parseInt(quantita))
        sheet.getRange(lastRow, secondTable[1]).setValue(oggetto)
        sheet.getRange(lastRow, secondTable[2]).setValue(currentDate)
        sheet.getRange(lastRow, secondTable[3]).setValue(parseFloat(denaro))

    } else {
        sendDiscordMessage(`Se stai leggendo questo messaggio vuol dire che qualcosa è andato incredibilmente storto`)
    }
}

function sendDiscordMessage(message) {
  UrlFetchApp.fetch(botWebserverUrl, { method: "post", payload: message})
}

function test() {
    addData("Aurelio Colombo ha pagato una fattura di 1583$ del giorno 22/11/1897 | 01:26", "fatture")
    addData("Hanno comprato 60x di Munizioni Revolver per 4122.0$", "blip")
}