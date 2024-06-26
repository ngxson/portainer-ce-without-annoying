const https = require('https');
const http = require('http');
const fs = require('fs');
const spawn = require('child_process').spawn;
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const INJECTED_HTML = `
  <style>
    /* hide Upgrade to Business on sidebar */
    div.sidebar > button {display: none !important;}

    /* hide Authentication logs */
    [aria-label="Authentication logs"] {display: none !important;}

    /* hide everything having the BE Feature banner */
    .be-indicator-container, .limited-be {display: none !important;}

    /* FIXME: hot fix to show OAuth save button #10 */
    .oauth-save-settings-button {display: inline-block !important;}

    /* this should not be hidden, but let's make it more subtle */
    .be-indicator {
      filter: saturate(0) !important;
      opacity: 0.2 !important;
      pointer-events: none !important;
    }
  </style>
  <script>
    // Block tracking script matomo.cloud
    // https://github.com/ngxson/portainer-ce-without-annoying/issues/5
    (function () {
      var headNode = document.getElementsByTagName('script')[0].parentNode;

      // save the original function
      headNode.originalInsertBefore = headNode.insertBefore;

      // intercept the function call
      headNode.insertBefore = function(newNode, referenceNode) {
        if (newNode && newNode.src && newNode.src.indexOf('matomo') !== -1) {
          console.log('Blocked insertion of matomo script node');
        } else {
          headNode.originalInsertBefore(newNode, referenceNode);
        }
      }
    })();
  </script>
`;
const TARGET_URL = 'http://localhost:19000';
const SSL_CERT_PATH = '/data/certs/cert.pem';
const SSL_KEY_PATH = '/data/certs/key.pem';
const FORWARDED_ARGS = process.argv.slice(2);

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
app.get('/api/motd', (req, res) => {
  // hide the "Latest News From Portainer"
  // https://github.com/portainer/portainer/blob/master/app/portainer/views/home/home.html
  res.json({});
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
  const fwdArgs = FORWARDED_ARGS.join(' ');
  console.log(`Launching portainer with args ${fwdArgs}`)
  const child = spawn('/bin/sh', [
    '-c',
    `/portainer --bind=":19000" --bind-https=":19443" ${fwdArgs}`
  ]);
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

