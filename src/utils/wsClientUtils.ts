import { WsReconnect } from 'websocket-reconnect';

export function createWsListener(
  wsServerAddress: string | WsReconnect,
  topics: string[],
  onMessage: (topic: string, msg: Record<string, any>) => any,
): WsReconnect {
  let wsClient: WsReconnect;
  if (!wsServerAddress) throw new Error(`wsServerAddress is required`);
  if (typeof wsServerAddress === 'string') {
    wsClient = new WsReconnect();
    wsClient.open(wsServerAddress);
  } else {
    wsClient = wsServerAddress as WsReconnect;
  }

  wsClient.on('open', () => {
    console.log(`defi ws open ${wsServerAddress}, subscribing topic ${topics.join(',')}`);
    topics.forEach((topic) => {
      wsClient.send(JSON.stringify({ action: 'subscribe', payload: { topic } }));
    });
  });

  wsClient.on('message', (data: string) => {
    const json = JSON.parse(data.toString());
    if (json?.topic) {
      onMessage(json.topic, json.message);
    } else {
      console.log(`unknown ws message`, data.toString());
    }
  });
  wsClient.on('error', (err: any) => {
    console.error(`ws error`, err);
  });
  return wsClient;
}
