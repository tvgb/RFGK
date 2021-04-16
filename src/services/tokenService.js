const jwt = require('jsonwebtoken');

class TokenService {

	constructor() {
		this.refreshTokenLifeTimeJwt = '120d';
		this.refreshTokenLifeTimeCookie = 1000 * 60 * 60 * 24 * 120; // 120 dager i millisekunder.
		this.accessTokenLifeTimeJwt = '1h';
		this.accessTokenLifeTimeCookie = 1000 * 60 * 60; // 1 time i millisekunder.
	}

	createAccessToken(player) {
		const access_token = jwt.sign(
		{
			_id: player._id
		}, 
		process.env.JWT_ACCESS_SECRET,
		{
			expiresIn: this.accessTokenLifeTimeJwt
		});

		return access_token;
	}

	createRefreshToken(player) {
		const refresh_token = jwt.sign(
		{
			_id: player._id
		},
		process.env.JWT_REFRESH_SECRET,
		{
			expiresIn: this.refreshTokenLifeTimeJwt
		});

		return refresh_token;
	}

	createAccessTokenCookieOptionsObj() {
		const accessTokenCookieOptions = {
			maxAge: this.accessTokenLifeTimeCookie,
			httpOnly: false,
			secure: process.env.MODE === 'production' ? true : false,
			sameSite: 'lax'
		};

		return accessTokenCookieOptions;
	}

	createRefreshTokenCookieOptionsObj() {
		const refreshTokenCookieOptions = {
			maxAge: this.refreshTokenLifeTimeCookie,
			httpOnly: false,
			secure: process.env.MODE === 'production' ? true : false,
			sameSite: 'lax'
		};

		return refreshTokenCookieOptions;
	}

}

module.exports = new TokenService();