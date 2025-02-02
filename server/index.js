import express, { json } from 'express';
import cors from 'cors';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { secp256k1 as secp } from 'ethereum-cryptography/secp256k1';
import { utf8ToBytes } from 'ethereum-cryptography/utils';

const app = express();
const port = 3042;

app.use(cors());
app.use(json());

const profiles = new Map();
profiles.set('e4b512baeef600c93b715d2dd6dc02ae4ae5f0fb', {
  key: '03fa03f1d9900e0356c04ac7c3646db2bf7bade895474ad23a38313d90e3c03397',
  balance: 100,
  lastTimestamp: null
});

profiles.set('2dd196e30172e9ef59b4db391ea4f0097530dfbd', {
  key: '0351331073db764d7e6d4407784c98c163638eb88909a5466cd0277bae1524f06d',
  balance: 50,
  lastTimestamp: null
});

profiles.set('bca5790fe2f82d7f42262af28cf44ea11024d386',{
  key: '029d0612053739ebaacb4e1a071ce992fc970547e0440456edbbd4a19993f08621',
  balance: 75,
  lastTimestamp: null
});

app.get('/balance/:address', (req, res) => {
  const { address } = req.params;

  if (!profiles.has(address)) {
    res.status(404).send({ message: 'Address not found!' });
    return;
  }

  const balance = profiles.get(address).balance || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const { message, signature } = req.body;
  const { recipient, amount, sender, timestamp } = message;

  if (!profiles.has(sender)) {
    res.status(404).send({ message: 'Sender address not found!' });
    return;
  }

  if (!profiles.has(recipient)) {
    res.status(404).send({ message: 'Recipient address not found!' });
    return;
  }

  if (sender === recipient) {
    res.status(400).send({ message: 'Sender and recipient must be different!' });
    return;
  }

  if (timestamp <= profiles.get(sender).lastTimestamp) {
    res.status(400).send({ message: 'Invalid transaction!' });
    return;
  }
  profiles.get(sender).lastTimestamp = timestamp;

  const messageHash = keccak256(utf8ToBytes(JSON.stringify(message)));
  const isSignatureValid = secp.verify(signature, messageHash, profiles.get(sender).key);
  if (!isSignatureValid) {
    res.status(400).send({ message: 'Invalid signature!' });
    return;
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (profiles.get(sender).balance < amount) {
    res.status(400).send({ message: 'Not enough funds!' });
  } else {
    profiles.get(sender).balance -= amount;
    profiles.get(recipient).balance += amount;
    res.send({ balance: profiles.get(sender).balance });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!profiles.get(address).balance) {
    profiles.get(address).balance = 0;
  }
}

