const https = require('https');

const url = 'https://api.ipify.org?format=json';

export async function getMyIp(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const request = https.request(url, (response: any) => {
      let data = '';
      response.on('data', (chunk: any) => {
        data = data + chunk.toString();
      });

      response.on('end', () => {
        const body = JSON.parse(data);
        resolve(body.ip as string);
      });
    });

    request.on('error', (error: any) => {
      console.log('request ipify error', error);
      reject(error);
    });
    request.end();
  });
}
