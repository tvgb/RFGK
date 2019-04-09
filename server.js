const http = require('http');
const https = require('https');
const fs = require('fs');
const app = require('./app');

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/xn--rnvikfrisbeegolf-lxb.no/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/xn--rnvikfrisbeegolf-lxb.no/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/xn--rnvikfrisbeegolf-lxb.no/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

// Running on port 3000 because NGINX is listening on port 3000
const port = 3000;

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
	console.log('HTTPS Server running on port', port);
});
