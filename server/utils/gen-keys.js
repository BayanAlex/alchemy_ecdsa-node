import { bls12_381 as bls } from 'ethereum-cryptography/bls.js';
import { toHex } from 'ethereum-cryptography/utils';
import { keccak256 } from 'ethereum-cryptography/keccak';
import * as secp from 'ethereum-cryptography/secp256k1';
import fs from 'fs/promises';

const privateKey = bls.utils.randomPrivateKey();
const publicKey = secp.secp256k1.getPublicKey(privateKey);
const address = keccak256(publicKey.slice(1)).slice(-20);
fs.appendFile('./keys.txt', `Private Key: ${toHex(privateKey)}\nPublic Key: ${toHex(publicKey)}\nAddress: ${toHex(address)}\n\n`);
