import { ethers, formatEther, formatUnits } from "ethers";
import React, { useState } from "react";
import Image from 'next/image'

const Header = () => {
	const [walletAddress, setWalletAddress] = useState(null);
	const [network, setNetwork] = useState('');
	const [balanceETH, setBalanceETH] = useState(null);
	const [balanceUSDT, setBalanceUSDT] = useState(null);

	const connectWallet = async () => {
		if (typeof window.ethereum !== "undefined") {
			try {
				const provider = new ethers.BrowserProvider(window.ethereum);
				const accounts = await provider.send("eth_requestAccounts", []);
				const network = await provider.getNetwork();
				const balanceETH = await provider.getBalance(accounts[0]);
				//const balanceUSDT = await provider.getBalance("ethers.usdt");
				const balanceUSDT = 0n;

				setWalletAddress(accounts[0]);
				setNetwork(network.name);
				setBalanceETH(balanceETH);
				setBalanceUSDT(balanceUSDT);
			} catch (error) {
				console.error("Error in wallet connection:", error);
			}
		} else {
			console.error("MetaMask doesn't exist.");
		}
	};

	const disconnectWallet = () => {
		setWalletAddress(null);
	};

	return (
		<div className="wallet">
			{walletAddress ? (
				<>
					<span>{network.toUpperCase()}</span>

					<div>
						<div>{formatEther(balanceETH).slice(0, 8)} ETH</div>
						<div>{formatUnits(balanceUSDT, 6)} USDT</div>
					</div>

					<button
						className=""
						onClick={disconnectWallet}
					>
						Disconnect <span>({walletAddress.slice(0, 6)}...{walletAddress.slice(-4)})</span>
					</button>
				</>
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

export default Header;
