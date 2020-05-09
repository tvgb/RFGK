const nodemailer = require('nodemailer');

class EmailService {

	constructor() {

	}

	async sendMail() {

		let transporter = nodemailer.createTransport({
			host: 'smtp.domeneshop.no',
			port: 465,
			secure: true,
			auth: {
				user: process.env.IKKESVAR_EMAIL_USERNAME,
				pass: process.env.IKKESVAR_EMAIL_PASSWORD
			}
		});
	
		let info = await transporter.sendMail({
			from: '"Ikke Svar!" <ikkesvar@ronvikfrisbeegolf.no>',
			to: 'tvgb@outlook.com',
			subject: 'Hello my friend!',
			text: 'Hello world!',
			html: 
			`
			<h2>Du må se på denne mailen</h2>
			<b>Her er en liste over ting du må se på</b>
			<ul>
				<li> Ost </li>
				<li> Fisk </li>
				<li> Brød </li>
			</ul>
			`
		});
	
		console.log('Message sent: %s', info.messageId);
	
		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	}
	
	async sendVerificationEmail(senderEmail, receiverEmail, receiverName, verificationToken) {
		let transporter = nodemailer.createTransport({
			host: 'smtp.domeneshop.no',
			port: 465,
			secure: true,
			auth: {
				user: process.env.IKKESVAR_EMAIL_USERNAME,
				pass: process.env.IKKESVAR_EMAIL_PASSWORD
			}
		});
	
		await transporter.sendMail({
			from: `"Rønvik Frisbeegolfklubb" <${senderEmail}>`,
			to: receiverEmail,
			subject: 'Bekreft epostadresse',
			text: 'For å kunne ta i bruk kontoen din på rønvikfrisbeegolf.no må du bekrefte epostadressen din først.',
			html: 
			`
			<!DOCTYPE html>
			<html>
				<head>
					<meta charset="utf-8">
					<link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>

					<style>
						body {
							font-family: 'Poppins';
						}

						#container {
							margin: 20px 50px;
						}

						h1 {
							text-align: center;
						}

						#verifyBtn {
							background-color: green;
							color: white;
							padding: 14px 25px;
							border-radius: 3px;
							text-align: center;
							text-decoration: none;
							display: inline-block;
						}

						#regards {
							font-size: 0.8em;
							margin-top: 50px;
							color: lightslategray;
						}
					</style>
				</head>

				<body>
					<div id="container">
						<h1>Bekreft epost</h1>
						<p>
							Hei ${receiverName},
							<br>
							<br>

							For å kunne ta i bruk kontoen din på rønvikfrisbeegolf.no må du bekrefte epostadressen din først.
							Dette gjør du ved å trykke på knappen under. Knappen vil være gyldig i 24 timer.
						</p>
						<iframe name="dummyframe" id="dummyframe" style="display: none;"></iframe>

						<a id="verifyBtn" href="${process.env.SERVER_URL}/api/player/verify/${verificationToken}"> Bekreft epost </a>

						<p id="regards">
							Mvh.
							<br>
							Rønvik Frisbeegolfklubb
						</p>
					</div>
				</body>
			</html>
			`
		});
	}
}

module.exports = new EmailService();