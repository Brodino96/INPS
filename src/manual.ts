// -------------------------------------------------------------------- //

import axios from "axios"

// -------------------------------------------------------------------- //

const webServerUrl = process.env.WEBSERVER_URL
const type = {
    0: "fatture",
    1: "blip"
}

// -------------------------------------------------------------------- //

async function inputString(type) {
    let input = prompt("Incolla stringa: ")
    axios.post(webServerUrl!, { message: input, tableType: type })
    .then(response => console.log(response.statusText))
    .catch(error => console.log(error))
}

async function init() {
    let input = prompt("Fattura or blip [0 or 1]: ")
    if (input == "0" || input == "1") {
        return inputString(type[input])
    }
    console.log("Invalid entry")
}

console.log(webServerUrl)

init()