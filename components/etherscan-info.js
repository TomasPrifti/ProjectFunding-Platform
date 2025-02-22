import Link from "next/link";
import Image from 'next/image';
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/utils/context";
import { etherscanLink } from "@/constants/index";

const EtherscanInfo = ({ contractAddress, view = "contract" }) => {
	const {
		user,
		setUser
	} = useContext(UserContext);

	const [etherscanBaseUrl, setEtherscanBaseUrl] = useState("");
	const [transactionDeployment, setTransactionDeployment] = useState(null);
	const [listTransactions, setListTransactions] = useState([]);

	const getEtherscanInfo = async () => {
		const provider = user.provider;

		try {
			// Check if the contract Manager is deployed.
			const contractCode = await provider.getCode(contractAddress);
			if (contractCode === "0x") {
				console.error("Error: The main contract doesn't exist");
				return;
			}

			// Get the latest block deployed on the chain.
			const latestBlock = await provider.getBlock("latest");
			let blockNumber = latestBlock.number;

			let tempTransactionDeployment;
			const tempListTransactions = [];

			// Searching trought all the blocks going backward to find the deployment's one.
			while (blockNumber >= 0) {
				const block = await provider.getBlock(blockNumber, true);

				// Searching where the transaction has no target address (property "to").
				for (const txHash of block.transactions) {
					const tx = await provider.getTransaction(txHash);

					// Check if the transaction is a deployment one.
					if (tx.to === null) {
						tempTransactionDeployment = tx;
					}

					if (tx.to === contractAddress) {
						tempTransactionDeployment = null;
						if (view == "contract") {
							continue;
						}

						if (view == "transactions") {
							tempListTransactions.push(tx);
						}
					}
				}

				// Go to the previous block.
				blockNumber--;
			}
			if (view == "contract") {
				setTransactionDeployment(tempTransactionDeployment);
				return;
			}

			tempListTransactions.push(tempTransactionDeployment);
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

		setEtherscanBaseUrl(etherscanLink[user.chainId]);
		getEtherscanInfo();
	}, [contractAddress]);

	return (
		<>
			{view === "contract" && (
				<div className="etherscan-info contract">
					<div>See on Etherscan:</div>

					<ul>
						<li>
							<Link href={`${etherscanBaseUrl}tx/${transactionDeployment?.hash}`}>
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
							onClick={getEtherscanInfo}
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
