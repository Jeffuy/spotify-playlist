import NextAuth from 'next-auth'
import SpotifyProvider from 'next-auth/providers/spotify'
import * as jwt from 'next-auth/jwt'

const jwtConfig = {
	secret: process.env.NEXT_SECRET,
	encode: async ({ token, secret }) => {
		const jwtClaims = {
			...token,
			accessToken: token.accessToken,
			exp: Math.floor(Date.now() / 1000) + 60 * 60, // Configura la expiración en 1 hora
		};
		const encodedToken = await jwt.encode({ token: jwtClaims, secret });
		return encodedToken;
	},
	decode: async ({ token, secret }) => {
		const decodedToken = await jwt.decode({ token, secret });
		return decodedToken;
	},
};

export default NextAuth({
	providers: [
		SpotifyProvider({
			clientId: process.env.SPOTIFY_CLIENT_ID,
			clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
			authorization:
				'https://accounts.spotify.com/authorize?scope=user-read-email,playlist-read-private,playlist-modify-private,playlist-modify-public',
			accessTokenUrl: 'https://accounts.spotify.com/api/token',

		}),
	],
	secret: process.env.NEXT_SECRET,
	jwt: jwtConfig,
	callbacks: {
		async jwt({ token, account }) {
			//console.log("account: ", account)
			//console.log(token)
			if (account) {
				token.accessToken = account.access_token;
				token.refreshToken = account.refresh_token;
				token.expiresAt = Date.now() + account.expires_in * 1000;
			}
			//console.log(token)
			return token;
		},
		async session(session, token) {
			//console.log(token)
			if(token){
			session.user = token;
			session.accessToken = token.accessToken;
			session.refreshToken = token.refreshToken;
			session.expiresAt = token.expiresAt;
			//console.log("HOLAAA")
			}
			//console.log(session)
			return session;
			
		},
	},
});
