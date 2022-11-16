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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const immutable_1 = require("immutable");
const uuid = __importStar(require("uuid"));
class Subscription {
    constructor() {
        this.subscriptions = new immutable_1.Map();
    }
    /**
     * Return subsciption
     * @param id
     */
    get(id) {
        return this.subscriptions.get(id);
    }
    /**
     * Add new subscription
     * @param topic
     * @param clientId
     * @param type
     * @returns {*}
     */
    add(topic, clientId, type = 'ws') {
        // need to find subscription with same type = 'ws'
        const findSubscriptionWithClientId = this.subscriptions.find((sub) => sub.clientId === clientId && sub.type === type && sub.topic === topic);
        if (findSubscriptionWithClientId) {
            // exist and no need add more subscription
            return findSubscriptionWithClientId.id;
        }
        const id = this.autoId();
        const subscription = {
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
    remove(id) {
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
    getSubscriptions(predicate = null) {
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
exports.Subscription = Subscription;
