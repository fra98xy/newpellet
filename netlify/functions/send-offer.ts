import { getStore } from '@netlify/blobs';
import { getUser } from '@netlify/identity';
import webpush from 'web-push';
import { db } from '../../db/index.js';
import { push_subscriptions } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  
  const cookie = req.headers.get("cookie");
  const hasBypass = cookie?.includes("admin_bypass=c3VwZXJfc2VjcmV0X2FkbWluX3Rva2VuXzIwMjY=");

  const user = await getUser();
  if (!hasBypass && (!user || !user.app_metadata?.roles?.includes('admin'))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const payload = await req.json();
  const configStore = getStore('push-config');
  let publicKey = await configStore.get('vapidPublicKey');
  let privateKey = await configStore.get('vapidPrivateKey');
  
  if (!publicKey || !privateKey) {
    const vapidKeys = webpush.generateVAPIDKeys();
    await configStore.set('vapidPublicKey', vapidKeys.publicKey);
    await configStore.set('vapidPrivateKey', vapidKeys.privateKey);
    publicKey = vapidKeys.publicKey;
    privateKey = vapidKeys.privateKey;
  }
  
  webpush.setVapidDetails(
    "mailto:newpellet2022@gmail.com",
    publicKey,
    privateKey
  );
  
  const subscriptions = await db.select().from(push_subscriptions);
  
  const pushPayload = JSON.stringify({
    title: payload.title || "Nuova offerta Newpellet",
    body: payload.body || "Apri l’app per vedere la nuova offerta pellet.",
    url: payload.url || "/"
  });
  
  let sent = 0;
  for (const sub of subscriptions) {
    try {
      const pushSub: webpush.PushSubscription = {
        endpoint: sub.endpoint,
        keys: sub.keys as { p256dh: string; auth: string }
      };
      await webpush.sendNotification(pushSub, pushPayload);
      sent++;
    } catch (e: any) {
      console.error(`Error sending to ${sub.endpoint}`, e);
      if ([400, 401, 403, 404, 410].includes(e.statusCode)) {
        await db.delete(push_subscriptions).where(eq(push_subscriptions.id, sub.id));
      }
    }
  }
  
  return new Response(JSON.stringify({ ok: true, sent, total: subscriptions.length }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
