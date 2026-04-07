// JWE encrypt/decrypt using node-jose
// Usage:
//   node jwe.js genkey [alg]                              (default alg=RSA1_5)
//   node jwe.js encrypt <text|@file|-> [alg] [enc]        (defaults: RSA1_5, A128CBC-HS256; - reads stdin)
//   node jwe.js decrypt <jwe>

const fs = require('fs');
const jose = require('node-jose');

const KEY_FILE = 'rsa-key.json';
const DEFAULT_ALG = 'RSA1_5';
const DEFAULT_ENC = 'A128CBC-HS256';

async function loadOrCreateKey(alg) {
  if (fs.existsSync(KEY_FILE)) {
    const jwk = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));
    return jose.JWK.asKey(jwk);
  }
  const key = await jose.JWK.createKey('RSA', 2048, { alg, use: 'enc' });
  fs.writeFileSync(KEY_FILE, JSON.stringify(key.toJSON(true), null, 2));
  console.error('Wrote new key to', KEY_FILE);
  return key;
}

async function encrypt(plaintext, alg, enc) {
  const key = await loadOrCreateKey(alg);
  return jose.JWE.createEncrypt(
    { format: 'compact', fields: { alg, enc } },
    key
  ).update(Buffer.from(plaintext, 'utf8')).final();
}

async function decrypt(jwe) {
  const key = await loadOrCreateKey(DEFAULT_ALG);
  const result = await jose.JWE.createDecrypt(key).decrypt(jwe);
  return result.plaintext.toString('utf8');
}

(async () => {
  const [cmd, ...rest] = process.argv.slice(2);
  try {
    if (cmd === 'genkey') {
      await loadOrCreateKey(rest[0] || DEFAULT_ALG);
    } else if (cmd === 'encrypt') {
      let [text, alg = DEFAULT_ALG, enc = DEFAULT_ENC] = rest;
      if (!text) throw new Error('missing <text>');
      if (text === '-') {
        text = fs.readFileSync(0, 'utf8');
      } else if (text.startsWith('@')) {
        text = fs.readFileSync(text.slice(1), 'utf8');
      }
      // If it parses as JSON, re-serialize to a canonical compact form.
      try { text = JSON.stringify(JSON.parse(text)); } catch {}
      console.log(await encrypt(text, alg, enc));
    } else if (cmd === 'decrypt') {
      if (!rest[0]) throw new Error('missing <jwe>');
      const out = await decrypt(rest[0]);
      try {
        process.stdout.write(JSON.stringify(JSON.parse(out), null, 2) + '\n');
      } catch {
        process.stdout.write(out + (out.endsWith('\n') ? '' : '\n'));
      }
    } else {
      console.error('Usage:');
      console.error('  node jwe.js genkey [alg]');
      console.error('  node jwe.js encrypt <text> [alg] [enc]');
      console.error('  node jwe.js decrypt <jwe>');
      process.exit(1);
    }
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
