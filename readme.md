# Newpellet Web App / PWA

Base pronta per:
- catalogo prodotti pellet
- selezione di più prodotti
- carrello rapido
- ordine via WhatsApp
- installazione su schermata Home
- funzionamento offline base
- notifiche offerte tramite Web Push (tramite Netlify Functions)

## File principali

- `index.html`: struttura della web app
- `styles.css`: grafica mobile pulita
- `app.js`: prodotti, carrello, WhatsApp, installazione, notifiche
- `sw.js`: service worker per offline cache e push
- `manifest.webmanifest`: installazione PWA
- `assets/`: logo e immagini prodotto placeholder
- `netlify/functions/`: backend serverless per Web Push (iscrizioni e invio)

## Come sostituire foto e prodotti

In `app.js`, modifica l'array `products`.

Esempio:
```js
{
  id:"nome-prodotto",
  name:"Pellet GMG Austria",
  description:"Descrizione breve",
  price:7.50,
  unit:"sacco",
  pack:"Bancale 60 sacchi",
  image:"assets/foto-prodotto.jpg",
  tags:["15 kg","ENplus A1","Consegna inclusa"]
}
```

Poi metti la foto dentro `assets/`.

## Pubblicazione

Caricata su Netlify con GitHub. Il backend funziona in modalità serverless tramite Netlify Functions e Blobs (senza necessità di database dedicato).

## Invio notifiche push (Offerte)

Puoi inviare notifiche push (offerte) chiamando la function `/.netlify/functions/send-offer` (metodo POST) e inviando il payload desiderato. Le iscrizioni sono gestite automaticamente.
