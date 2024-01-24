import { PubSub } from '../controllers/pubsub';
import http from 'http';
import * as WebSocket from 'ws';

export async function main() {
  const port = 7555;
  const httpServer = http.createServer({});
  httpServer.listen(port);
  const wssServer = new WebSocket.Server({ server: httpServer });
  const pubsub = new PubSub({ wss: wssServer });
}

main();
