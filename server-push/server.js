import express from "express";
import webpush from "web-push";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

/*
1) Installa:
   npm install
2) Genera chiavi:
   npx web-push generate-vapid-keys
3) Inserisci le chiavi qui sotto o in variabili ambiente.
4) Pubblica su server HTTPS.
*/

const publicVapidKey = process.env.VAPID_PUBLIC_KEY || "INSERISCI_PUBLIC_KEY";
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || "INSERISCI_PRIVATE_KEY";

webpush.setVapidDetails(
  "mailto:newpellet2022@gmail.com",
  publicVapidKey,
  privateVapidKey
);

// Demo: in produzione salva su database.
const subscriptions = [];

app.get("/vapid-public-key", (req, res) => {
  res.json({ publicKey: publicVapidKey });
});

app.post("/subscribe", (req, res) => {
  const sub = req.body;
  if(!subscriptions.find(s => s.endpoint === sub.endpoint)){
    subscriptions.push(sub);
  }
  res.json({ ok:true, total: subscriptions.length });
});

app.post("/send-offer", async (req, res) => {
  const payload = JSON.stringify({
    title: req.body.title || "Nuova offerta Newpellet",
    body: req.body.body || "Apri l’app per vedere la nuova offerta pellet.",
    url: req.body.url || "/"
  });

  const results = await Promise.allSettled(
    subscriptions.map(sub => webpush.sendNotification(sub, payload))
  );

  res.json({ ok:true, sent: results.filter(r=>r.status==="fulfilled").length, total: subscriptions.length });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server push Newpellet attivo");
});
