import NextAuth from 'next-auth'
import SpotifyProvider from 'next-auth/providers/spotify'

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
	callbacks: {
		async jwt({ token, account }) {
			if (account) {
				token.accessToken = account.access_token;
			}
			return token;
		},
		async session(session, user) {
			session.user = user;
			return session;
		},
	},

});