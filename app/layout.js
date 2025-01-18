'use client'

import Head from "next/head";
import { MoralisProvider } from "react-moralis";
import "../styles/globals.css";

import Header from '@/components/header';

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<Head>
				<title>ProjectFunding</title>
				<meta name="description" content="ProjectFunding - Decentralized Crowdfunding Platform" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<body>
				<MoralisProvider initializeOnMount={false}>
					<Header />
					{children}
				</MoralisProvider>
			</body>
		</html>
	)
}
