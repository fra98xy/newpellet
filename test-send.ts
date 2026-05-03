import { db } from "./db/index.js";
import { push_subscriptions } from "./db/schema.js";
import webpush from 'web-push';
import { getStore } from '@netlify/blobs';

async function main() {
  const store = getStore('push-config');
  const publicKey = await store.get('vapidPublicKey');
  const privateKey = await store.get('vapidPrivateKey');

  console.log("Keys:", publicKey ? "present" : "missing");
  
  if (!publicKey || !privateKey) {
    console.error("No VAPID keys!");
    return;
  }

  webpush.setVapidDetails(
    "mailto:newpellet2022@gmail.com",
    publicKey,
    privateKey
  );

  const subs = await db.select().from(push_subscriptions);
  const pushPayload = JSON.stringify({
    title: "Test",
    body: "This is a test notification",
    url: "/"
  });

  for (const sub of subs) {
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: sub.keys as { p256dh: string; auth: string }
      }, pushPayload);
      console.log(`Sent to ${sub.endpoint}`);
    } catch (e: any) {
      console.error(`Error sending to ${sub.endpoint}:`, e.message);
    }
  }
}

main().catch(console.error);
