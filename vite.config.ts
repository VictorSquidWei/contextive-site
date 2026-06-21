import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-only: handle POST /api/subscribe locally (the Vercel function only runs when
// deployed), so the email capture is testable in `npm run dev`. Logs each signup to
// the dev-server console — the local mirror of the production "our list" capture.
function devSubscribeApi(): Plugin {
  return {
    name: 'dev-subscribe-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/subscribe', (req: any, res: any) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end();
        }
        let raw = '';
        req.on('data', (c: any) => (raw += c));
        req.on('end', () => {
          let email = '';
          try {
            email = (JSON.parse(raw || '{}').email || '').trim().toLowerCase();
          } catch {
            /* ignore */
          }
          (globalThis as any).console?.log?.(
            `[subscribe:dev] ${new Date().toISOString()} ${email || '(invalid)'}`
          );
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = email ? 200 : 400;
          res.end(
            JSON.stringify({
              ok: !!email,
              substackUrl: `https://contextive.substack.com/subscribe${
                email ? `?email=${encodeURIComponent(email)}` : ''
              }`,
            })
          );
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devSubscribeApi()],
});
