import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/utils/context";
import { etherscanLink } from "@/constants/index";

const EtherscanInfo = ({ contractAddress }) => {
	const {
		user,
		setUser
	} = useContext(UserContext);

	const [etherscanBaseUrl, setEtherscanBaseUrl] = useState("");
	const [transactionHash, setTransactionHash] = useState("");

	const getTransactionHash = async () => {
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

			// Searching trought all the blocks going backward to find the deployment's one.
			while (blockNumber >= 0) {
				const block = await provider.getBlock(blockNumber, true);

				// Searching where the transaction has no target address (property "to").
				for (const txHash of block.transactions) {
					const tx = await provider.getTransaction(txHash);
					// Check if the transaction is a deployment one.
					if (tx.to === null) {
						setTransactionHash(tx.hash);
						return;
					}
				}

				// Go to the previous block.
				blockNumber--;
			}
		} catch (error) {
			console.error("Error: ", error);
			return;
		}
	}

	useEffect(() => {
		if (!user?.chainId || etherscanLink[user?.chainId]?.length == 0) {
			return;
		}
		// The Contract Address is not defined.
		if (!contractAddress || contractAddress.length === 0) {
			return;
		}

		setEtherscanBaseUrl(etherscanLink[user.chainId]);
		getTransactionHash();
	}, [contractAddress]);

	if (etherscanBaseUrl.length == 0) {
		return;
	}

	return (
		<div className="etherscan-info">
			<div>See on Etherscan:</div>

			<ul>
				<li>
					<Link href={`${etherscanBaseUrl}tx/${transactionHash}`}>
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
	);
};

export default EtherscanInfo;
