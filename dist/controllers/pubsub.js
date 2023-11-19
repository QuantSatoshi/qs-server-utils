"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSub = void 0;
const immutable_1 = require("immutable");
const uuid = __importStar(require("uuid"));
const subscription_1 = require("./subscription");
const commonUtils_1 = require("../utils/commonUtils");
const events_1 = __importDefault(require("events"));
class PubSub extends events_1.default {
    constructor(ctx) {
        super();
        this.clients = new immutable_1.Map();
        this.subscription = new subscription_1.Subscription();
        this.wss = ctx.wss;
        this.load();
        this.startedTime = Date.now();
        this.handleLogin = ctx.handleLogin;
    }
    setHandleLogin(handleLogin) {
        this.handleLogin = handleLogin;
    }
    setHandleNewClientConnectMessage(handleNewClient) {
        this.handleNewClientConnectMessage = handleNewClient;
    }
    load() {
        const wss = this.wss;
        wss.on('connection', (ws) => {
            const id = this.autoId();
            const client = {
                id: id,
                ws: ws,
                userId: null,
                subscriptions: [],
                allowPublish: false,
                allowBroadcast: false,
            };
            // add new client to the map
            this.addClient(client);
            console.log(`new client connected`);
            // listen when receive message from client
            ws.on('message', (message) => this.handleReceivedClientMessage(id, message));
            ws.on('close', () => {
                console.log('Client is disconnected');
                // Find user subscriptions and remove
                const userSubscriptions = this.subscription.getSubscriptions((sub) => sub.clientId === id);
                userSubscriptions.forEach((sub) => {
                    const subInfo = this.subscription.get(sub.id);
                    if (subInfo) {
                        console.log(`unsubscribe`, subInfo.topic, subInfo.clientId);
                        this.emit('unsubscribe', subInfo.topic, subInfo.clientId);
                    }
                    this.subscription.remove(sub.id);
                });
                // now let remove client
                this.removeClient(id);
            });
        });
    }
    /**
     * Handle add subscription
     * @param topic
     * @param clientId = subscriber
     */
    handleAddSubscription(topic, clientId) {
        if (!topic)
            throw new Error(`topic is required for handleAddSubscription`);
        const client = this.getClient(clientId);
        if (client) {
            const subscriptionId = this.subscription.add(topic, clientId);
            client.subscriptions.push(subscriptionId);
            this.addClient(client);
            this.emit(`subscribe`, topic, clientId);
        }
    }
    /**
     * Handle unsubscribe topic
     * @param topic
     * @param clientId
     */
    handleUnsubscribe(topic, clientId) {
        if (!topic)
            throw new Error(`topic is required for handleUnsubscribe`);
        const client = this.getClient(clientId);
        let clientSubscriptions = (client === null || client === void 0 ? void 0 : client.subscriptions) || [];
        const userSubscriptions = this.subscription.getSubscriptions((s) => s.clientId === clientId && s.type === 'ws' && s.topic === topic);
        userSubscriptions.forEach((sub) => {
            // now let remove subscriptions
            this.subscription.remove(sub.id);
        });
        const userSubIdsToRemove = userSubscriptions.map((sub) => sub.id);
        clientSubscriptions = clientSubscriptions.filter((id) => !userSubIdsToRemove.includes(id));
        // let update client subscriptions
        if (client) {
            client.subscriptions = clientSubscriptions;
            this.addClient(client);
        }
        this.emit(`unsubscribe`, topic, clientId);
    }
    /**
     * Handle publish a message to a topic
     * @param topic
     * @param message
     * @param from
     * @isBroadcast = false that mean send all, if true, send all not me
     */
    handlePublishMessage(topic, message, from, isBroadcast = false) {
        let subscriptions = isBroadcast
            ? this.subscription.getSubscriptions((sub) => sub.topic === topic && sub.clientId !== from)
            : this.subscription.getSubscriptions((sub) => sub.topic === topic);
        // now let send to all subscribers in the topic with exactly message from publisher
        subscriptions.forEach((subscription) => {
            const clientId = subscription.clientId;
            const subscriptionType = subscription.type;
            // we are only handle send via websocket
            if (subscriptionType === 'ws') {
                this.send(clientId, {
                    topic: topic,
                    message: message,
                });
            }
        });
    }
    isLoggedIn(clientId) {
        const client = this.getClient(clientId);
        return client === null || client === void 0 ? void 0 : client.loggedIn;
    }
    /**
     * Handle receive client message
     * @param clientId
     * @param message
     */
    handleReceivedClientMessage(clientId, messageStr) {
        var _a, _b;
        const client = this.getClient(clientId);
        if (!client) {
            console.error(`no client for ${clientId}`);
            return;
        }
        const message = (0, commonUtils_1.stringToJson)(messageStr);
        const topic = (_a = message === null || message === void 0 ? void 0 : message.payload) === null || _a === void 0 ? void 0 : _a.topic;
        const payloadMessage = (_b = message === null || message === void 0 ? void 0 : message.payload) === null || _b === void 0 ? void 0 : _b.message;
        const action = message === null || message === void 0 ? void 0 : message.action;
        switch (action) {
            case 'me':
                //Client is asking for his info
                this.send(clientId, { action: 'me', payload: { id: clientId, userId: client.userId } });
                break;
            case 'login':
                if (this.handleLogin) {
                    this.handleLogin(message, client).then((loginSuccess) => {
                        client.loggedIn = loginSuccess;
                    });
                }
                break;
            case 'subscribe':
                if (topic) {
                    this.handleAddSubscription(topic, clientId);
                }
                break;
            case 'unsubscribe':
                if (topic) {
                    this.handleUnsubscribe(topic, clientId);
                }
                break;
            case 'forceRestart':
                if (Date.now() - this.startedTime > 120000) {
                    console.log(`exiting due to forceRestart`, message);
                    setTimeout(() => process.exit(0), 3000);
                }
                break;
            case 'publish':
                if (topic && client.allowPublish) {
                    const from = clientId;
                    this.handlePublishMessage(topic, payloadMessage, from);
                }
                break;
            case 'broadcast':
                if (topic && client.allowBroadcast) {
                    this.handlePublishMessage(topic, payloadMessage, clientId, true);
                }
                break;
            default:
                break;
        }
    }
    publish(topic, msg) {
        this.handlePublishMessage(topic, msg, null, false);
    }
    /**
     * Add new client connection to the map
     * @param client
     */
    addClient(client) {
        if (!client.id) {
            client.id = this.autoId();
        }
        this.clients = this.clients.set(client.id, client);
    }
    /**
     * Remove a client after disconnecting
     * @param id
     */
    removeClient(id) {
        this.clients = this.clients.remove(id);
    }
    /**
     * Get a client connection
     * @param id
     * @returns {V | undefined}
     */
    getClient(id) {
        return this.clients.get(id);
    }
    /**
     * Generate an ID
     * @returns {*}
     */
    autoId() {
        return uuid.v4();
    }
    /**
     * Send to client message
     * @param message
     */
    send(clientId, message) {
        const client = this.getClient(clientId);
        if (!client) {
            return;
        }
        const ws = client.ws;
        try {
            const msg = typeof message !== 'string' ? JSON.stringify(message) : message;
            ws.send(msg);
        }
        catch (err) {
            console.log('An error convert object message to string', err);
        }
    }
}
exports.PubSub = PubSub;
