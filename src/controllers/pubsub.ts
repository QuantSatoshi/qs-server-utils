import { Map } from 'immutable';
import * as uuid from 'uuid';
import { Subscription } from './subscription';
import { stringToJson } from '../utils/commonUtils';
import EventEmitter from 'events';

export namespace PubSub {
  export interface Client {
    id: string;
    ws: any;
    userId: string | null;
    loggedIn?: boolean;
    subscriptions: string[];
    allowPublish: boolean;
    allowBroadcast: boolean;
  }
}

export class PubSub extends EventEmitter {
  wss: any;
  clients: Map<string, any> = new (Map as any)();
  subscription = new Subscription();
  startedTime: number;
  handleLogin?: (message: any, client: PubSub.Client) => Promise<any>;
  handleNewClientConnectMessage?: () => Promise<any>;

  constructor(ctx: { wss: any; handleLogin?: (message: any, client: PubSub.Client) => any }) {
    super();
    this.wss = ctx.wss;
    this.load();
    this.startedTime = Date.now();
    this.handleLogin = ctx.handleLogin;
  }

  setHandleLogin(handleLogin: (message: any, client: PubSub.Client) => Promise<any>) {
    this.handleLogin = handleLogin;
  }

  setHandleNewClientConnectMessage(handleNewClient: () => Promise<any>) {
    this.handleNewClientConnectMessage = handleNewClient;
  }

  protected load() {
    const wss = this.wss;

    wss.on('connection', (ws: any) => {
      const id = this.autoId();

      const client: PubSub.Client = {
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
      ws.on('message', (message: string) => this.handleReceivedClientMessage(id, message));

      ws.on('close', () => {
        console.log('Client is disconnected');
        // Find user subscriptions and remove
        const userSubscriptions = this.subscription.getSubscriptions((sub: any) => sub.clientId === id);
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
  protected handleAddSubscription(topic: string, clientId: string, sign?: string) {
    if (!topic) throw new Error(`topic is required for handleAddSubscription`);
    const client = this.getClient(clientId);
    if (client) {
      const subscriptionId = this.subscription.add(topic, clientId);
      client.subscriptions.push(subscriptionId);
      this.addClient(client);
      this.emit(`subscribe`, topic, clientId, sign);
    }
  }

  /**
   * Handle unsubscribe topic
   * @param topic
   * @param clientId
   */
  protected handleUnsubscribe(topic: string, clientId: string) {
    if (!topic) throw new Error(`topic is required for handleUnsubscribe`);
    const client = this.getClient(clientId);

    let clientSubscriptions = client?.subscriptions || [];

    const userSubscriptions = this.subscription.getSubscriptions(
      (s: any) => s.clientId === clientId && s.type === 'ws' && s.topic === topic,
    );

    userSubscriptions.forEach((sub) => {
      // now let remove subscriptions
      this.subscription.remove(sub.id);
    });
    const userSubIdsToRemove = userSubscriptions.map((sub) => sub.id);
    clientSubscriptions = clientSubscriptions.filter((id: string) => !userSubIdsToRemove.includes(id));

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
  protected handlePublishMessage(topic: string, message: any, from: string | null, isBroadcast = false) {
    let subscriptions = isBroadcast
      ? this.subscription.getSubscriptions((sub: Subscription.Sub) => sub.topic === topic && sub.clientId !== from)
      : this.subscription.getSubscriptions((sub: Subscription.Sub) => sub.topic === topic);
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

  isLoggedIn(clientId: string) {
    const client = this.getClient(clientId);
    return client?.loggedIn;
  }

  /**
   * Handle receive client message
   * @param clientId
   * @param message
   */
  protected handleReceivedClientMessage(clientId: string, messageStr: string) {
    const client = this.getClient(clientId);
    if (!client) {
      console.error(`no client for ${clientId}`);
      return;
    }

    const message: { payload: { topic?: string; message?: string; sign?: string }; action: string } = stringToJson(
      messageStr,
    ) as any;
    const topic = message?.payload?.topic;
    const sign = message?.payload?.sign; // signature
    const payloadMessage = message?.payload?.message;

    const action = message?.action;
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
          this.handleAddSubscription(topic, clientId, sign);
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

  publish(topic: string, msg: any) {
    this.handlePublishMessage(topic, msg, null, false);
  }

  /**
   * Add new client connection to the map
   * @param client
   */
  protected addClient(client: PubSub.Client) {
    if (!client.id) {
      client.id = this.autoId();
    }
    this.clients = this.clients.set(client.id, client);
  }

  /**
   * Remove a client after disconnecting
   * @param id
   */
  protected removeClient(id: string) {
    this.clients = this.clients.remove(id);
  }

  /**
   * Get a client connection
   * @param id
   * @returns {V | undefined}
   */
  protected getClient(id: string): PubSub.Client | undefined {
    return this.clients.get(id);
  }

  /**
   * Generate an ID
   * @returns {*}
   */
  protected autoId() {
    return uuid.v4();
  }

  /**
   * Send to client message
   * @param message
   */
  send(clientId: string, message: any) {
    const client = this.getClient(clientId);
    if (!client) {
      return;
    }
    const ws = client.ws;
    try {
      const msg = typeof message !== 'string' ? JSON.stringify(message) : message;
      ws.send(msg);
    } catch (err) {
      console.log('An error convert object message to string', err);
    }
  }
}
