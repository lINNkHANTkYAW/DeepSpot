import 'dotenv/config';
import { createApp } from './app';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = await createApp();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DeepSpot server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
