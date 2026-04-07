# NodeJoseJWE

A small script using [node-jose](https://github.com/cisco/node-jose) to encrypt and decrypt JWE content.

Supported algorithms:
- Key wrapping: `RSA1_5`
- Content encryption: `A128CBC-HS256`

## Install

```bash
npm install
```

## Usage

Generate an RSA keypair (written to `rsa-key.json`, auto-created on first encrypt/decrypt if missing):

```bash
node jwe.js genkey
```

Encrypt — prints a compact JWE. The payload can be a literal string, `@file` to
read from a file, or `-` to read from stdin. If the input parses as JSON it is
normalized (re-serialized compactly) before encryption:

```bash
node jwe.js encrypt "hello world"
node jwe.js encrypt '{"user":"alice","role":"admin"}'
node jwe.js encrypt @payload.json
echo '{"user":"alice"}' | node jwe.js encrypt -
```

Decrypt a compact JWE. If the plaintext is valid JSON it is pretty-printed;
otherwise it is written to stdout as-is (no quoting/escaping):

```bash
node jwe.js decrypt "<jwe-compact-string>"
```

### Example

```bash
$ node jwe.js encrypt '{"user":"alice","role":"admin"}'
eyJhbGciOiJSU0ExXzUiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2Iiwia2lkIjoiLi4uIn0....

$ node jwe.js decrypt "eyJhbGciOiJSU0ExXzUi...."
{
  "user": "alice",
  "role": "admin"
}
```

## Notes

- `rsa-key.json` contains the **private** JWK — do not commit it.
- The JOSE header uses `alg=RSA1_5`, `enc=A128CBC-HS256`.
