import { Map } from 'immutable';
import * as uuid from 'uuid';

export namespace Subscription {
  export interface Sub {
    id: string;
    topic: string;
    clientId: string;
    type: string;
  }
}

export class Subscription {
  subscriptions: Map<string, any> = new (Map as any)();

  /**
   * Return subsciption
   * @param id
   */
  get(id: string) {
    return this.subscriptions.get(id);
  }

  /**
   * Add new subscription
   * @param topic
   * @param clientId
   * @param type
   * @returns {*}
   */
  add(topic: string, clientId: string, type: string = 'ws') {
    // need to find subscription with same type = 'ws'

    const findSubscriptionWithClientId = this.subscriptions.find(
      (sub: any) => sub.clientId === clientId && sub.type === type && sub.topic === topic,
    );

    if (findSubscriptionWithClientId) {
      // exist and no need add more subscription
      return findSubscriptionWithClientId.id;
    }
    const id = this.autoId();
    const subscription: Subscription.Sub = {
      id: id,
      topic: topic,
      clientId: clientId,
      type: type, // email, phone
    };

    console.log('New subscriber via add method:', subscription);
    this.subscriptions = this.subscriptions.set(id, subscription);
    return id;
  }

  /**
   * Remove a subsciption
   * @param id
   */
  remove(id: string) {
    this.subscriptions = this.subscriptions.remove(id);
  }

  /**
   * Clear all subscription
   */
  clear() {
    this.subscriptions = this.subscriptions.clear();
  }

  /**
   * Get Subscriptions
   * @param predicate
   * @returns {any}
   */
  getSubscriptions(predicate: any = null) {
    return predicate ? this.subscriptions.filter(predicate) : this.subscriptions;
  }

  /**
   * Generate new ID
   * @returns {*}
   */
  autoId() {
    return uuid.v4();
  }
}
