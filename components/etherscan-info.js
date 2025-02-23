import Link from "next/link";
import Image from 'next/image';
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/utils/context";
import { etherscan } from "@/constants/index";
require('dotenv').config();

const EtherscanInfo = ({ contractAddress, view = "contract" }) => {
	const {
		user,
		setUser
	} = useContext(UserContext);

	const [etherscanBaseUrl, setEtherscanBaseUrl] = useState("");
	const [etherscanEndpoint, setEtherscanEndpoint] = useState("");
	const [transactionHashDeployment, setTransactionHashDeployment] = useState("");
	const [listTransactions, setListTransactions] = useState([]);

	const getEtherscanInfoContract = async () => {
		if (process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY === "") {
			return;
		}
		if (etherscan["endpoint"][user.chainId] === "" || etherscan["link"][user.chainId] === "") {
			return;
		}
		setEtherscanEndpoint(etherscan["endpoint"][user.chainId]);
		setEtherscanBaseUrl(etherscan["link"][user.chainId]);

		// Creating the url to request data to Etherscan.
		let url = "";
		url += etherscanEndpoint;
		url += "?module=contract";
		url += "&action=getcontractcreation";
		url += `&contractaddresses=${contractAddress}`;
		url += `&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY}`;
		const response = await fetch(url);
		const data = await response.json();

		if (!data || data["message"] != "OK") {
			return;
		}
		setTransactionHashDeployment(data["result"]["txHash"]);
	}

	const getEtherscanInfoTransactions = async () => {
		const provider = user.provider;

		try {
			// Check if the contract is deployed.
			const contractCode = await user.provider.getCode(contractAddress);
			if (contractCode === "0x") {
				console.error("Error: The main contract doesn't exist");
				return;
			}

			// Get the latest block deployed on the chain.
			const latestBlock = await provider.getBlock("latest");
			let blockNumber = latestBlock.number;

			const tempListTransactions = [];

			// Searching trought all the blocks going backward to find the deployment's one.
			while (blockNumber >= 0) {
				const block = await provider.getBlock(blockNumber, true);

				// Searching where the transaction has no target address (property "to").
				for (const txHash of block.transactions) {
					const tx = await provider.getTransaction(txHash);

					if (tx.to === contractAddress) {
						tempListTransactions.push(tx);
					}
					if (tx.hash === transactionHashDeployment) {
						tempListTransactions.push(tx);
					}
				}

				// Go to the previous block.
				blockNumber--;
			}

			setListTransactions(tempListTransactions);
		} catch (error) {
			console.error("Error: ", error);
			return;
		}
	}

	useEffect(() => {
		if (!user?.chainId) {
			return;
		}
		// The Contract Address is not defined.
		if (!contractAddress || contractAddress.length === 0) {
			return;
		}

		getEtherscanInfoContract();
		if (view == "contract") {
			return;
		}
		if (view == "transactions") {
			getEtherscanInfoTransactions();
			return;
		}
	}, [contractAddress]);

	return (
		<>
			{view === "contract" && (
				<div className="etherscan-info contract">
					<div>See on Etherscan:</div>

					<ul>
						<li>
							<Link href={`${etherscanBaseUrl}tx/${transactionHashDeployment}`}>
								Transaction
							</Link>
						</li>
						<li>
							<Link href={`${etherscanBaseUrl}address/${contractAddress}`}>
								Contract
							</Link>
						</li>
					</ul>
				</div>
			)}
			{view === "transactions" && (
				<div className="etherscan-info transactions">
					<div className="title-container">
						<h2>Contract Transactions ({listTransactions.length})</h2>

						<Image
							src="/reload.png"
							width={35}
							height={35}
							alt="Reload Transactions History"
							onClick={getEtherscanInfoTransactions}
						/>
					</div>

					<div className="list-transactions">
						{listTransactions.map((transaction) => {
							return (
								<div key={transaction.hash} className="transaction">
									<span>Block number: #{transaction.blockNumber}</span>
									<span>From: {transaction.from.slice(0, 6)}...{transaction.from.slice(-4)}</span>
									<Link href={`${etherscanBaseUrl}tx/${transaction.hash}`}>
										See on Etherscan
									</Link>
									<span>Block hash: {transaction.blockHash ? transaction.blockHash.slice(0, 6) + "..." + transaction.blockHash.slice(-4) : ""}</span>
									<span>To: {transaction.to ? transaction.to.slice(0, 6) + "..." + transaction.to.slice(-4) : "Contract Deployment"}</span>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</>
	);
};

export default EtherscanInfo;
