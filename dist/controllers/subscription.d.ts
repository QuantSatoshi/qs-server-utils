import { Map } from 'immutable';
export declare namespace Subscription {
    interface Sub {
        id: string;
        topic: string;
        clientId: string;
        type: string;
    }
}
export declare class Subscription {
    subscriptions: Map<string, any>;
    /**
     * Return subsciption
     * @param id
     */
    get(id: string): any;
    /**
     * Add new subscription
     * @param topic
     * @param clientId
     * @param type
     * @returns {*}
     */
    add(topic: string, clientId: string, type?: string): any;
    /**
     * Remove a subsciption
     * @param id
     */
    remove(id: string): void;
    /**
     * Clear all subscription
     */
    clear(): void;
    /**
     * Get Subscriptions
     * @param predicate
     * @returns {any}
     */
    getSubscriptions(predicate?: any): Map<string, any>;
    /**
     * Generate new ID
     * @returns {*}
     */
    autoId(): string;
}
