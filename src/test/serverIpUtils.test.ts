import { getMyIp } from '../utils/serverIpUtils';

export async function main() {
  console.log(`ip`, await getMyIp());
}
main();
