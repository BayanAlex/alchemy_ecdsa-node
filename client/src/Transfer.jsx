import { useState } from 'react';
import server from './server';
import { secp256k1 as secp } from 'ethereum-cryptography/secp256k1';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { utf8ToBytes } from 'ethereum-cryptography/utils';

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const setValue = (setter) => (evt) => setter(evt.target.value);

  function signMessage(message) {
    const hash = keccak256(utf8ToBytes(JSON.stringify(message)));
    return secp.sign(hash, privateKey);
  }

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const message = {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        timestamp: Date.now()
      };
      const signature = signMessage(message).toCompactHex();

      const {
        data: { balance },
      } = await server.post(`send`, { message, signature });
      setBalance(balance);
    } catch (ex) {
      console.log(ex)
      alert(ex.response.data.message);
    }
  }

  return (
    <form className='container transfer' onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder='1, 2, 3...'
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder='Type an address'
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type='submit' className='button' value='Transfer' />
    </form>
  );
}

export default Transfer;
