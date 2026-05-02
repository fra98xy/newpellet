import { getStore } from '@netlify/blobs';
import { getUser } from '@netlify/identity';
import webpush from 'web-push';

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  
  const user = await getUser();
  if (!user || !user.app_metadata?.roles?.includes('admin')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const payload = await req.json();
  const configStore = getStore('push-config');
  const publicKey = await configStore.get('vapidPublicKey');
  const privateKey = await configStore.get('vapidPrivateKey');
  
  if (!publicKey || !privateKey) {
    return new Response(JSON.stringify({ error: 'VAPID keys not configured' }), { status: 500 });
  }
  
  webpush.setVapidDetails(
    "mailto:newpellet2022@gmail.com",
    publicKey,
    privateKey
  );
  
  const subStore = getStore('push-subscriptions');
  const { blobs } = await subStore.list();
  
  const pushPayload = JSON.stringify({
    title: payload.title || "Nuova offerta Newpellet",
    body: payload.body || "Apri l’app per vedere la nuova offerta pellet.",
    url: payload.url || "/"
  });
  
  let sent = 0;
  for (const blob of blobs) {
    try {
      const sub = await subStore.get(blob.key, { type: 'json' });
      if (sub) {
        await webpush.sendNotification(sub as webpush.PushSubscription, pushPayload);
        sent++;
      }
    } catch (e: any) {
      console.error(`Error sending to ${blob.key}`, e);
      if (e.statusCode === 410 || e.statusCode === 404) {
        await subStore.delete(blob.key);
      }
    }
  }
  
  return new Response(JSON.stringify({ ok: true, sent, total: blobs.length }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
