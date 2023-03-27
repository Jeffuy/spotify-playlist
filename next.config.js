/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	env: {
		SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
		SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
		NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
		NEXT_SECRET: process.env.NEXT_SECRET,
		OPENAI_API_KEY: process.env.OPEN_AI_API_KEY,
	},
}

module.exports = nextConfig
