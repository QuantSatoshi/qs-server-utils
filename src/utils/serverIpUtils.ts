const https = require('https');

const url = 'https://api.ipify.org?format=json';

export async function getMyIp() {
  return new Promise((resolve, reject) => {
    const request = https.request(url, (response: any) => {
      let data = '';
      response.on('data', (chunk: any) => {
        data = data + chunk.toString();
      });

      response.on('end', () => {
        const body = JSON.parse(data);
        resolve(body.ip);
      });
    });

    request.on('error', (error: any) => {
      console.log('request ipify error', error);
      reject(error);
    });
    request.end();
  });
}
