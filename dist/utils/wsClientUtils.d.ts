import { WsReconnect } from 'websocket-reconnect';
export declare function createWsListener(wsServerAddress: string | WsReconnect, topics: string[], onMessage: (topic: string, msg: Record<string, any>) => any): WsReconnect;
