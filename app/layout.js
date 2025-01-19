'use client'

import Head from "next/head";
import "@/styles/globals.css";
import "@/styles/index.scss";

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
				<Header />
				{children}
			</body>
		</html>
	)
}
