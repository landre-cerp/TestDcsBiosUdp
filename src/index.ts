import * as dgram from 'dgram';
import { networkInterfaces } from 'os';

const PORT = 5010;
const MULTICAST_ADDR = '239.255.50.10';

// Créez le socket UDP avec l'option reuseAddr
const client = dgram.createSocket({ type: 'udp4', reuseAddr: true });

client.on('listening', () => {
  const address = client.address();
  console.log(`UDP Client listening on ${address.address}:${address.port}`);

  // Lister les interfaces réseau disponibles
  const interfaces = networkInterfaces();
  console.log('Network Interfaces:', interfaces);

  // Joindre le groupe multicast sur l'interface de boucle locale
  try {
    client.addMembership(MULTICAST_ADDR, '0.0.0.0');
    console.log(`Joined multicast group ${MULTICAST_ADDR} on interface 127.0.0.1`);
  } catch (error) {
    console.error(`Failed to join multicast group: ${(error as Error).message}`);
  }
});

client.on('message', (message, remote) => {
  console.log(`Received message from ${remote.address}:${remote.port} - ${message.toString()}`);
});

client.on('error', (err) => {
  console.log(`UDP Client error: ${err.stack}`);
  client.close();
});

// Liaison à l'interface locale
client.bind(PORT, '0.0.0.0', () => {
  console.log(`Client bound to port ${PORT}`);
});
