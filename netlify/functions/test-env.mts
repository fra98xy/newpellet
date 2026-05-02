export default async () => {
  return new Response(JSON.stringify({
    processEnv: !!process.env,
    netlifyEnv: typeof Netlify !== 'undefined'
  }));
}
