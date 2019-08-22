const nodemailer = require('nodemailer');

class mailer {
	constructor() {

	}

	async sendMail(sender, receivers) {
		let transporter = nodemailer.createTransport({
			host: 'smtp.domeneshop.no',
			port: 587,
			secure: false,
			auth: {
				user: 'ronvikfrisbeego1',
				pass: 'skuld-blek-2020-Uret-Pose'
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
	
		console.log("Message sent: %s", info.messageId);
	
		console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
	}
	
	async sendVerificationEmail(senderEmail, receiverEmail, verificationHash) {
		let transporter = nodemailer.createTransport({
			host: 'smtp.domeneshop.no',
			port: 587,
			secure: false,
			auth: {
				user: process.env.EMAILACCOUNTUSERNAME,
				pass: process.env.EMAILACCOUNTPASSWORD
			}
		});
	

		await transporter.sendMail({
			from: `"Rønvik Frisbeegolfklubb" <${senderEmail}>`,
			to: receiverEmail,
			subject: 'Bekreft epostadresse',
			text: 'Du må bekrefte epostadressen!',
			html: 
			`
			<html>
				<head>
					<style>
						h1 {
							text-align: center;
						}
					</style>
				</head>
				<body>
					<h1>Bekreft epost</h1>
					<p>
						Før du kan motta mail fra oss i Rønvik Frisbeegolfklubb kreves det at du bekreft epostadressen din,
						ved å trykke på knappen under. Knappen vil være gyldig i 7 dager. Du trenger ikke å bekrefte eposten for
						å ta i bruk rønvikfrisbeegolf.no.
						
					</p>
					<a href="http://localhost:3000/api/players/verify/123/tvgb@outlook.com">
						<button href >Bekreft epost</button>
					</a>
				</body>
			</html>
			`
		});

		console.log('Mail sent');
	}
}

module.exports = new mailer();