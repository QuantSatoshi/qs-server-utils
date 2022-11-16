export function stringToJson(message: string | Buffer) {
  try {
    if (typeof message === 'object') {
      return JSON.parse(message.toString());
    }
    return JSON.parse(message);
  } catch (e) {
    console.error(`stringToJson error`, e);
  }
  return {};
}
