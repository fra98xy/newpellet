import { getStore } from '@netlify/blobs';

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  
  const subscription = await req.json();
  const store = getStore('push-subscriptions');
  
  const key = btoa(subscription.endpoint).replace(/=/g, '');
  await store.setJSON(key, subscription);
  
  const { blobs } = await store.list();
  
  return new Response(JSON.stringify({ ok: true, total: blobs.length }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
