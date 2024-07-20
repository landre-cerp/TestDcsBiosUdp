import * as dgram from 'dgram';

const PORT = 5010;
const MULTICAST_ADDR = '239.255.50.10';
const syncSequence = new Uint8Array([0x55, 0x55, 0x55, 0x55]);

let dcsbiosData : Buffer = Buffer.alloc(65536);
// Create the UDP socket with reuseAddr option
const client = dgram.createSocket({ type: 'udp4', reuseAddr: true });

client.on('listening', () => {
  const address = client.address();
  console.log(`UDP Client listening on ${address.address}:${address.port}`);
  client.addMembership(MULTICAST_ADDR, '0.0.0.0');
});

let antiskid = 0;

client.on('message', (message, remote) => {
  if (detectUpdate(message)) {

    let offset = 4;

    // Go through each update block in the message.
    while (message.length - offset > 0) {
      let startAddress = message.readUInt16LE(offset);
      offset += 2;
      
      let dataLenB = message.readUInt16LE(offset);
      offset += 2;

      message.copy(dcsbiosData, startAddress, offset, offset + dataLenB);
     
      offset += dataLenB;
      

      if (startAddress === 0x1110) {
        
        console.log(`Anti Skid : ${decodeValue(dcsbiosData, 0x1110, 0x0080, 7) ? 'ON' : 'OFF'}`);
        
      }
      if (startAddress === 0x10d4)
        console.log(`CL_B1: ${decodeValue(dcsbiosData, 0x10d4, 0x0010, 4)}`);


  } }
  else {
      console.log(`Received invalid message: ${bytesToHex(message)}`);
  }
});

client.on('error', (err) => {
  console.log(`UDP Client error: ${err.stack}`);
  client.close();
});

// Bind to the local interface
client.bind(PORT, '0.0.0.0', () => {
  console.log(`Client bound to port ${PORT}`);
});


function bytesToHex(byteArray: Uint8Array): string {
    return Array.from(byteArray)
        .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
        .join(' ');
}

function detectUpdate(message: Buffer): boolean {
    if (message.length < 4) {
        return false;
    }

    // Séquence de synchronisation à chercher
    

    // Comparez les premiers 4 octets du message avec la séquence de synchronisation
    for (let i = 0; i < 4; i++) {
        if (message[i] !== syncSequence[i]) {
            return false;
        }
    }

    return true;
}

function decodeValue(buffer: Buffer, startAddress: number, mask: number, shift: number): number {
    // L'adresse de début est en octets
    const index = startAddress;

    // Vérifier que l'index est valide et qu'il y a suffisamment de données pour lire 16 bits
    if (index < 0 || index + 2 > buffer.length) {
        throw new RangeError(`Index ${index} is out of range. Buffer length: ${buffer.length}`);
    }

    // Lire la valeur 16 bits à partir de l'index
    const value = buffer.readUInt16LE(index);

    // Appliquer le masque et le décalage
    const decodedValue = (value & mask) >> shift;

    return decodedValue;
}