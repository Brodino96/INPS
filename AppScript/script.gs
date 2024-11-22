const initialRow = 3
const firstTable = [9, 10, 11, 12] // Colonne I, J, K, L
const secondTable = [14, 15, 16, 17] // Colonne N, O, P, Q

function doGet(e) {
    return HtmlService.createHtmlOutput("Web app attiva!")
}

function doPost(e) {
    let message = e.parameter.message
    let tableType = e.parameter.tableType
  
    if (message && tableType) {
        addData(message, tableType)
        return ContentService.createTextOutput("Dati aggiunti correttamente!")
    } else {
        return sendDiscordMessage("Errore, parametri mancanti")
    }
}

function addData(message, tableType) {

    const foglio = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("INPS")
    const date = new Date()

    if (tableType === "fatture") {
        
        const regex = /(.*?) ha pagato una fattura di ([\d.]+)\$ del giorno (\d{2}\/\d{2}\/\d{4}) \| (\d{2}:\d{2})/
        const match = message.match(regex)
        if (match) {
            const [_, persona, denaro, , ora] = match
        
            let lastRow = initialRow
            while (foglio.getRange(lastRow, firstTable[0]).getValue() !== "") {
                lastRow++
            }
            
            foglio.getRange(lastRow, firstTable[0]).setValue(persona)
            foglio.getRange(lastRow, firstTable[1]).setValue(date)
            foglio.getRange(lastRow, firstTable[2]).setValue(ora)
            foglio.getRange(lastRow, firstTable[3]).setValue(parseFloat(denaro))
        } else {
            sendDiscordMessage(`Messaggio non valido per la tabella fatture: \`${message}\``)
        }

    } else if (tableType === "blip") {
        
        const regex = /Hanno comprato (\d+)x di (.*?) per ([\d.]+)\$/
        const match = message.match(regex)
        if (match) {
            const [_, quantita, oggetto, denaro] = match

            let lastRow = initialRow
            while (foglio.getRange(lastRow, secondTable[0]).getValue() !== "") {
                lastRow++
            }

            foglio.getRange(lastRow, secondTable[0]).setValue(parseInt(quantita))
            foglio.getRange(lastRow, secondTable[1]).setValue(oggetto)
            foglio.getRange(lastRow, secondTable[2]).setValue(date)
            foglio.getRange(lastRow, secondTable[3]).setValue(parseFloat(denaro))
        } else {
            sendDiscordMessage(`Messaggio non valido per la tabella blip: \`${message}\``)

        }
    } else {
        sendDiscordMessage(`Se stai leggendo questo messaggio vuol dire che qualcosa è andato incredibilmente storto`)

    }
}

function sendDiscordMessage(msg) {
}


function test() {
    addData("Aurelio Colombo ha pagato una fattura di 1583$ del giorno 22/11/1897 | 01:26", "fatture")
    addData("Hanno comprato 60x di Munizioni Revolver per 4122.0$", "blip")
}