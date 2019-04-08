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

const portHTTP = process.env.PORT || 3000;
const portHTTPS = 443;

server.listen(port, () => {
    console.log("Server listening on", port);
});

// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(portHTTP, () => {
	console.log('HTTP Server running on port', portHTTP);
});

httpsServer.listen(portHTTPS, () => {
	console.log('HTTPS Server running on port 443', portHTTPS);
});