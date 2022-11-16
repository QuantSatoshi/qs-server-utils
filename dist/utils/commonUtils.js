"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToJson = void 0;
function stringToJson(message) {
    try {
        if (typeof message === 'object') {
            return JSON.parse(message.toString());
        }
        return JSON.parse(message);
    }
    catch (e) {
        console.error(`stringToJson error`, e);
    }
    return {};
}
exports.stringToJson = stringToJson;
