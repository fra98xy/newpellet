import { getStore } from '@netlify/blobs';
import webpush from 'web-push';

export default async (req: Request) => {
  const store = getStore('push-config');
  let publicKey = await store.get('vapidPublicKey');
  
  if (!publicKey) {
    const vapidKeys = webpush.generateVAPIDKeys();
    await store.set('vapidPublicKey', vapidKeys.publicKey);
    await store.set('vapidPrivateKey', vapidKeys.privateKey);
    publicKey = vapidKeys.publicKey;
  }
  
  return new Response(JSON.stringify({ publicKey }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
