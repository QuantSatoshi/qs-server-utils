"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWsListener = void 0;
const websocket_reconnect_1 = require("websocket-reconnect");
function createWsListener(wsServerAddress, topics, onMessage) {
    let wsClient;
    if (!wsServerAddress)
        throw new Error(`wsServerAddress is required`);
    if (typeof wsServerAddress === 'string') {
        wsClient = new websocket_reconnect_1.WsReconnect();
        wsClient.open(wsServerAddress);
    }
    else {
        wsClient = wsServerAddress;
    }
    wsClient.on('open', () => {
        console.log(`defi ws open ${wsServerAddress}, subscribing topic ${topics.join(',')}`);
        topics.forEach((topic) => {
            wsClient.send(JSON.stringify({ action: 'subscribe', payload: { topic } }));
        });
    });
    wsClient.on('message', (data) => {
        const json = JSON.parse(data.toString());
        if (json === null || json === void 0 ? void 0 : json.topic) {
            onMessage(json.topic, json.message);
        }
        else {
            console.log(`unknown ws message`, data.toString());
        }
    });
    return wsClient;
}
exports.createWsListener = createWsListener;
