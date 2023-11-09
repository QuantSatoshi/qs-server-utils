/// <reference types="node" />
import { Map } from 'immutable';
import { Subscription } from './subscription';
import EventEmitter from 'events';
export declare namespace PubSub {
    interface Client {
        id: string;
        ws: any;
        userId: string | null;
        loggedIn?: boolean;
        subscriptions: string[];
        allowPublish: boolean;
        allowBroadcast: boolean;
    }
}
export declare class PubSub extends EventEmitter {
    wss: any;
    clients: Map<string, any>;
    subscription: Subscription;
    startedTime: number;
    handleLogin?: (message: any, client: PubSub.Client) => Promise<any>;
    handleNewClientConnectMessage?: () => Promise<any>;
    constructor(ctx: {
        wss: any;
        handleLogin?: (message: any, client: PubSub.Client) => any;
    });
    setHandleLogin(handleLogin: (message: any, client: PubSub.Client) => Promise<any>): void;
    setHandleNewClientConnectMessage(handleNewClient: () => Promise<any>): void;
    protected load(): void;
    /**
     * Handle add subscription
     * @param topic
     * @param clientId = subscriber
     */
    protected handleAddSubscription(topic: string, clientId: string): void;
    /**
     * Handle unsubscribe topic
     * @param topic
     * @param clientId
     */
    protected handleUnsubscribe(topic: string, clientId: string): void;
    /**
     * Handle publish a message to a topic
     * @param topic
     * @param message
     * @param from
     * @isBroadcast = false that mean send all, if true, send all not me
     */
    protected handlePublishMessage(topic: string, message: any, from: string | null, isBroadcast?: boolean): void;
    isLoggedIn(clientId: string): boolean | undefined;
    /**
     * Handle receive client message
     * @param clientId
     * @param message
     */
    protected handleReceivedClientMessage(clientId: string, messageStr: string): void;
    publish(topic: string, msg: any): void;
    /**
     * Add new client connection to the map
     * @param client
     */
    protected addClient(client: PubSub.Client): void;
    /**
     * Remove a client after disconnecting
     * @param id
     */
    protected removeClient(id: string): void;
    /**
     * Get a client connection
     * @param id
     * @returns {V | undefined}
     */
    protected getClient(id: string): PubSub.Client | undefined;
    /**
     * Generate an ID
     * @returns {*}
     */
    protected autoId(): string;
    /**
     * Send to client message
     * @param message
     */
    send(clientId: string, message: any): void;
}
