import { ethers, formatEther, formatUnits } from "ethers";
import React, { useState, useEffect } from "react";
import Image from 'next/image'

const Wallet = () => {
	const [walletAddress, setWalletAddress] = useState(null);
	const [network, setNetwork] = useState('');
	const [balanceETH, setBalanceETH] = useState(null);
	const [balanceUSDT, setBalanceUSDT] = useState(null);

	const setAllData = async (provider, accounts) => {
		if (typeof window.ethereum === "undefined") {
			console.error("MetaMask doesn't exist.");
			return;
		}

		try {
			const network = await provider.getNetwork();
			const balanceETH = await provider.getBalance(accounts[0]);
			//const balanceUSDT = await provider.getBalance("ethers.usdt");
			const balanceUSDT = 0n;

			window.ethereum.on('chainChanged', () => {
				window.location.reload();
			})
			window.ethereum.on('accountsChanged', () => {
				window.location.reload();
			})

			setWalletAddress(accounts[0]);
			setNetwork(network.name);
			setBalanceETH(balanceETH);
			setBalanceUSDT(balanceUSDT);
		} catch (error) {
			console.error("Error in wallet connection:", error);
		}
	};

	const connectWallet = async () => {
		if (typeof window.ethereum === "undefined") {
			console.error("MetaMask doesn't exist.");
			return;
		}

		const provider = new ethers.BrowserProvider(window.ethereum);
		const accounts = await provider.send("eth_requestAccounts", []);
		setAllData(provider, accounts);
	};

	const verifyConnection = () => {
		if (typeof window.ethereum === "undefined") {
			console.error("MetaMask doesn't exist.");
			return;
		}

		const accounts = window.ethereum._state.accounts;
		if (accounts.length === 0) {
			// Not connected.
			return;
		}

		const provider = new ethers.BrowserProvider(window.ethereum);
		setAllData(provider, accounts);
	};

	useEffect(() => {
		verifyConnection();
	}, []);

	return (
		<div className="wallet">
			{walletAddress ? (
				<div className="logged">
					<div className="tokens">
						<div>{formatEther(balanceETH).slice(0, 8)} ETH</div>
						<div>{formatUnits(balanceUSDT, 6)} USDT</div>
					</div>

					<span>{network.toUpperCase()} ({walletAddress.slice(0, 6)}...{walletAddress.slice(-4)})</span>
				</div>
			) : (
				<button
					className="metamask-button"
					onClick={connectWallet}
				>
					<Image
						src="/metamask.png"
						width={50}
						height={50}
						alt="MetaMask - Logo"
					/>
					Connect Wallet
				</button>
			)}
		</div>
	);
};

export default Wallet;
