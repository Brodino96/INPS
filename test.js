var a = "https://script.google.com/macros/s/AKfycbzoqnVSrmVLY8lGMJMuqBboi_lfPHiHQSQpmatW5EqRLLB6F388pgUhGcdMbAJ0_oaDUQ/exec"

fetch(a, {
    method: 'POST',
    body: new URLSearchParams({
      'message': 'Aurelio Colombo ha pagato una fattura di 7$ del giorno 22/11/1897 | 01:26',
      'tableType': 'fatture'
    })
  })
  .then(response => response.text())
  .then(data => console.log(data))
  .catch(error => console.error('Errore:', error));
  