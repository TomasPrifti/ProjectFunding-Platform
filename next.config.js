/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'export', // Enable static export.
	images: {
		unoptimized: true, // Disable images optimization.
	},
	assetPrefix: "./", // Modify paths to static resources.
};

module.exports = nextConfig;
