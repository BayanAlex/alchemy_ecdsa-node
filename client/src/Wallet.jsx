import server from './server';
import * as secp from 'ethereum-cryptography/secp256k1';
import { toHex } from 'ethereum-cryptography/utils';
import { keccak256 } from 'ethereum-cryptography/keccak';

function Wallet({ privateKey, setPrivateKey, address, setAddress, balance, setBalance }) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    try {
      const publicKey = secp.secp256k1.getPublicKey(privateKey);
      const address = keccak256(publicKey.slice(1)).slice(-20);
      setAddress(toHex(address));
      if (address) {
        const {
          data: { balance },
        } = await server.get(`balance/${toHex(address)}`);
        setBalance(balance);
      } else {
        setBalance(0);
      }
    } catch (ex) {
      setBalance(null);
      if (ex.message.includes('invalid private key')) {
        setAddress(privateKey.length ? 'Invalid private key' : '');
        return;
      }
      console.log(ex.message);
    }
  }

  return (
    <div className='container wallet'>
      <h1>Your Wallet</h1>

      <label>
        Private key
        <input placeholder='Type a private key' value={privateKey} onChange={onChange}></input>
      </label>
      <div className='address'>
        <div>Address:</div>
        <div className='address-value'>{address.length ? address : ''}</div>
      </div>

      <div className='balance'>Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
