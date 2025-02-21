'use client'

import Head from "next/head";
import { useState } from 'react';
import Header from '@/components/header';
import { UserContext } from '@/utils/context';

import "@/styles/globals.css";
import "@/styles/index.scss";

export default function RootLayout({ children }) {
	const [user, setUser] = useState(null);

	const backgroundImageStyle = {
		backgroundImage: 'url(./dashboard.png)',
	};

	return (
		<html lang="en">
			<Head>
				<title>ProjectFunding</title>
				<meta name="description" content="ProjectFunding - Decentralized Crowdfunding Platform" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<body>
				<UserContext.Provider
					value={{
						user,
						setUser
					}}
				>
					<Header />
					<main style={backgroundImageStyle}>
						<div className="overlay">
							<div className="container">
								{children}
							</div>
						</div>
					</main>
				</UserContext.Provider>
			</body>
		</html>
	)
}
