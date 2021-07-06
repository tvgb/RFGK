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
						
						#btn-div {
							text-align: center;
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

							<br>
							<br>

							Funksjonalitet for å legge til egne runder vil bli tilgjengelig for deg når en administrator har verifisert profilen din.
						</p>
						<iframe name="dummyframe" id="dummyframe" style="display: none;"></iframe>

						<div id="btn-div">
						<a id="verifyBtn" href="${process.env.SERVER_URL}/api/player/verify/${verificationToken}" style="color: white"> Bekreft epost </a>
						</div>
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

	async sendResetPasswordEmail(senderEmail, receiverEmail, receiverName, accessToken) {
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
			subject: 'Tilbakestilling av passord',
			text: 'Mail med link for å tilbakestille passordet.',
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

						#resetPasswordBtn {
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

						#btn-div {
							text-align: center;
						}
					</style>
				</head>

				<body>
					<div id="container">
						<h1>Tilbakestilling av passord</h1>
						<p>
							Hei ${receiverName}
							<br>
							<br>
			
							Du har bedt om å få tilbakestilt passordet ditt. 
							Trykk på knappen under for å gjøre dette. Knappen er gyldig i 1 time. Hvis du ikke har bedt om
							å få tilbakestilt passordet ditt kan du bare ignorere denne eposten.
						</p>
						<iframe name="dummyframe" id="dummyframe" style="display: none;"></iframe>
						
						<div id="btn-div">
							<a id="resetPasswordBtn" href="${process.env.SERVER_URL}/api/player/verifyResetPassword/${accessToken}"> Tilbakestill passordet </a>
						</div>
			
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