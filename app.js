const https = require('https');
const http = require('http');
const fs = require('fs');
const spawn = require('child_process').spawn;
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const INJECTED_HTML = `
  <style>
    /* hide Upgrade to Business on sidebar */
    div.sidebar > button {display: none;}
  </style>
`;
const TARGET_URL = 'http://localhost:19000';
const SSL_CERT_PATH = '/data/certs/cert.pem';
const SSL_KEY_PATH = '/data/certs/key.pem';

// proxy logic
const app = express();
app.get('/', async (req, res) => {
  try {
    const response = await fetch(TARGET_URL);
    const body = await response.text();
    const newBody = body.replace('<head>', `<head>${INJECTED_HTML}`);
    res.send(newBody);
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});
app.use(createProxyMiddleware({
  target: TARGET_URL,
  ws: true,
}));

// http + https server
async function waitUntilCertAvailable() {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  while (!fs.existsSync(SSL_CERT_PATH)) {
    await sleep(1000);
  }
};
async function runServer() {
  http.createServer(app).listen(9000);
  await waitUntilCertAvailable();
  https.createServer({
    key: fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH),
  }, app).listen(9443);
}

// child process for portainer
function runPortainer() {
  const child = spawn('/bin/sh', ['-c', '/portainer --bind=":19000" --bind-https=":19443"']);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  child.on('exit', function (code) {
    console.log(`portainer exited with status code ${code}`);
    process.exit(code);
  });
  process.on('SIGTERM', function () {
    child.kill('SIGTERM');
  });
}

// run it
runPortainer();
runServer();

