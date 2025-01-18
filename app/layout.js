'use client'

import { MoralisProvider } from "react-moralis";
import "../styles/globals.css";
import Header from '@/components/header';

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>
				<MoralisProvider initializeOnMount={false}>
					<Header />
					{children}
				</MoralisProvider>
			</body>
		</html>
	)
}
