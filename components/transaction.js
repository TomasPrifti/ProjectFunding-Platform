import { formatUnits } from "ethers";
import { useContext, useRef, useState, useEffect } from "react";
import { UserContext } from "@/utils/context";

const Transaction = ({ transactionId, transaction, project, view = "row" }) => {
	const {
		user,
		setUser
	} = useContext(UserContext);

	const [showNotificationPopup, setShowNotificationPopup] = useState(false);
	const notificationText = useRef("");
	const notificationClasses = useRef("");

	const isSigned = useRef(transaction.isSignedByMe);

	const notifyUser = (text = "Something happen", classes = "") => {
		setShowNotificationPopup(true);
		notificationText.current = text;
		notificationClasses.current = classes;
	}

	const executeTransaction = async (event, transactionId) => {
		console.log('execute');
	}

	const revokeTransaction = async (event, transactionId) => {
		console.log('revoke');
	}

	const signTransaction = async (event, transactionId) => {
		if (!isFinancier() || isSigned.current) {
			return;
		}

		try {
			// Sending transaction.
			const transactionResponse = await project.contract.signTransaction(
				transactionId,
			);

			// Awaiting confirmations.
			const transactionReceipt = await transactionResponse.wait();
		} catch (error) {
			console.error("Error in sending transaction:", error);
			notifyUser("Error in sending transaction", "error");
			return;
		}

		// Updating User's information.
		user.balanceETH = await user.provider.getBalance(user.address);
		setUser({
			...user,
			balanceETH: user.balanceETH,
		});

		transaction.numConfirmations++;
		isSigned.current = true;
	}

	const isOwner = () => {
		return user.signer.address === project.owner;
	}

	const isFinancier = () => {
		return user.signer.address !== project.owner && project.financiers.includes(user.signer.address);
	}

	useEffect(() => {
		isSigned.current = transaction.isSignedByMe;
	}, [transaction.isSignedByMe])

	return (
		<>
			{view === "row" && (
				<div id={transactionId} className="transaction view-row">
					<div className="details">
						<p><span>#</span>{transactionId}</p>
						<p><span>Destination: </span>{transaction.destination}</p>
						<p><span>Amount: </span>{formatUnits(transaction.amount, 6)} USDT</p>
						<p><span>Number of confirmations: </span>{transaction.numConfirmations}</p>
						<p><span>Status: </span>{transaction.statusLabel}</p>
					</div>

					{transaction.status === 0 && (
						<div className="actions">
							{isOwner() && (
								<>
									<button className="execute" onClick={(event) => executeTransaction(event, transactionId)}>Execute</button>
									<button className="revoke" onClick={(event) => revokeTransaction(event, transactionId)}>Revoke</button>
								</>
							)}
							{isFinancier() && (
								!isSigned.current && (
									<button className="sign" onClick={(event) => signTransaction(event, transactionId)}>Sign Transaction</button>
								) || (
									<p>You have signed</p>
								)
							)}
						</div>
					)}
				</div>
			)}
		</>
	);
};

export default Transaction;
