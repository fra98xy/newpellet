# Newpellet Web App / PWA

Base pronta per:
- catalogo prodotti pellet
- selezione di più prodotti
- carrello rapido
- ordine via WhatsApp
- installazione su schermata Home
- funzionamento offline base
- predisposizione notifiche offerte con Web Push

## File principali

- `index.html`: struttura della web app
- `styles.css`: grafica mobile pulita
- `app.js`: prodotti, carrello, WhatsApp, installazione, notifiche
- `sw.js`: service worker per offline cache e push
- `manifest.webmanifest`: installazione PWA
- `assets/`: logo e immagini prodotto placeholder
- `server-push/`: piccolo backend Node per notifiche push reali

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

Puoi caricarla su Netlify, Vercel o un hosting HTTPS. Le notifiche push richiedono HTTPS.

## Notifiche vere anche ad app chiusa

Il pulsante nell'app chiede il permesso e mostra una notifica di test.  
Per inviare offerte anche quando l'app è chiusa serve collegare il frontend al backend in `server-push/`, generare chiavi VAPID e salvare le subscription degli utenti.
