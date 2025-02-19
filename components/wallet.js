import { ethers, formatEther, formatUnits } from "ethers";
import { useEffect, useContext } from "react";
import Image from 'next/image';
import { UserContext } from '@/utils/context';
import { contractAddresses, abi } from "@/constants/index";

const Wallet = () => {
	const {
		user,
		setUser
	} = useContext(UserContext);

	const setAllData = async (provider, accounts) => {
		if (typeof window.ethereum === "undefined") {
			console.error("MetaMask doesn't exist.");
			return;
		}

		try {
			const signer = await provider.getSigner();
			const network = await provider.getNetwork();
			const balanceETH = await provider.getBalance(accounts[0]);

			const usdt = new ethers.Contract(contractAddresses[network.chainId]["USDT"], abi[network.chainId]["USDT"], provider);
			const balanceUSDT = await usdt.balanceOf(accounts[0]);

			window.ethereum.on('chainChanged', () => {
				window.location.reload();
			})
			window.ethereum.on('accountsChanged', () => {
				window.location.reload();
			})

			setUser({
				address: accounts[0],
				provider: provider,
				signer: signer,
				network: network.name,
				chainId: network.chainId,
				balanceETH: balanceETH,
				balanceUSDT: balanceUSDT,
			});
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
			{user && user.address ? (
				<div className="logged">
					<div className="tokens">
						<div>{formatEther(user.balanceETH).slice(0, 8)} ETH</div>
						<div>{formatUnits(user.balanceUSDT, 6)} USDT</div>
					</div>

					<span>{user.network.toUpperCase()} ({user.address.slice(0, 6)}...{user.address.slice(-4)})</span>
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
