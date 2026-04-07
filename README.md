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

Encrypt a string — prints a compact JWE:

```bash
node jwe.js encrypt "hello world"
```

Decrypt a compact JWE:

```bash
node jwe.js decrypt "<jwe-compact-string>"
```

### Example

```bash
$ node jwe.js encrypt "hello world"
eyJhbGciOiJSU0ExXzUiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2Iiwia2lkIjoiLi4uIn0....

$ node jwe.js decrypt "eyJhbGciOiJSU0ExXzUi...."
hello world
```

## Notes

- `rsa-key.json` contains the **private** JWK — do not commit it.
- The JOSE header uses `alg=RSA1_5`, `enc=A128CBC-HS256`.
