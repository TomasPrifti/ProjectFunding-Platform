import { formatUnits } from "ethers";
import { useContext, useRef, useState } from "react";
import { UserContext } from "@/utils/context";
import NotificationPopup from "@/components/notification-popup";

const Transaction = ({ transactionId, transaction, project, setProject, view = "row" }) => {
	const {
		user,
		setUser
	} = useContext(UserContext);

	const [showNotificationPopup, setShowNotificationPopup] = useState(false);
	const notificationText = useRef("");
	const notificationClasses = useRef("");

	const notifyUser = (text = "Something happen", classes = "") => {
		setShowNotificationPopup(true);
		notificationText.current = text;
		notificationClasses.current = classes;
	}

	const executeTransaction = async (event, transactionId) => {
		if (!isOwner() || transaction.numConfirmations !== project.financiers.length) {
			notifyUser("Error in executing transaction", "error");
			return;
		}

		try {
			// Sending transaction.
			const transactionResponse = await project.contract.executeTransaction(
				transactionId,
			);

			// Awaiting confirmations.
			const transactionReceipt = await transactionResponse.wait();
		} catch (error) {
			console.error("Error in executing transaction:", error);
			notifyUser("Error in executing transaction", "error");
			return;
		}

		// Updating User's information.
		user.balanceETH = await user.provider.getBalance(user.address);
		setUser({
			...user,
			balanceETH: user.balanceETH,
		});

		// Updating Project's information.
		project.currentBalance = await project.contract.getUSDTBalance();
		project.capitalLocked = await project.contract.getCapitalLocked();
		project.capitalAvailable = project.currentBalance - project.capitalLocked;

		// Updating Project's transaction information.
		const rawTransaction = await project.contract.getTransaction(transactionId);
		project.transactions[transactionId].status = parseInt(rawTransaction[4]);
		project.transactions[transactionId].statusLabel = await project.contract.TransactionStatusLabel(rawTransaction[4]);

		setProject({ ...project });
		notifyUser("Transaction executed successfully", "success");
	}

	const revokeTransaction = async (event, transactionId) => {
		if (!isOwner()) {
			notifyUser("Error in revoking transaction", "error");
			return;
		}

		try {
			// Sending transaction.
			const transactionResponse = await project.contract.revokeTransaction(
				transactionId,
			);

			// Awaiting confirmations.
			const transactionReceipt = await transactionResponse.wait();
		} catch (error) {
			console.error("Error in revoking transaction:", error);
			notifyUser("Error in revoking transaction", "error");
			return;
		}

		// Updating User's information.
		user.balanceETH = await user.provider.getBalance(user.address);
		setUser({
			...user,
			balanceETH: user.balanceETH,
		});

		// Updating Project's information.
		project.currentBalance = await project.contract.getUSDTBalance();
		project.capitalLocked = await project.contract.getCapitalLocked();
		project.capitalAvailable = project.currentBalance - project.capitalLocked;

		// Updating Project's transaction information.
		const rawTransaction = await project.contract.getTransaction(transactionId);
		project.transactions[transactionId].status = parseInt(rawTransaction[4]);
		project.transactions[transactionId].statusLabel = await project.contract.TransactionStatusLabel(rawTransaction[4]);

		setProject({ ...project });
		notifyUser("Transaction revoked successfully", "success");
	}

	const signTransaction = async (event, transactionId) => {
		if (!isFinancier() || transaction.isSignedByMe) {
			notifyUser("Error in signing transaction", "error");
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
			console.error("Error in signing transaction:", error);
			notifyUser("Error in signing transaction", "error");
			return;
		}

		// Updating User's information.
		user.balanceETH = await user.provider.getBalance(user.address);
		setUser({
			...user,
			balanceETH: user.balanceETH,
		});

		// Updating Project's transactions.
		const rawTransaction = await project.contract.getTransaction(transactionId);
		project.transactions[transactionId].numConfirmations = parseInt(rawTransaction[3]);
		project.transactions[transactionId].isSignedByMe = await project.contract.isTransactionSignedByMe(transactionId);

		setProject(project);
		notifyUser("Transaction signed successfully", "success");
	}

	const isOwner = () => {
		return user.signer.address === project.owner;
	}

	const isFinancier = () => {
		return user.signer.address !== project.owner && project.financiers.includes(user.signer.address);
	}

	return (
		<>
			{view === "row" && (
				<div id={transactionId} className="transaction view-row">
					<div className="details">
						<p className="number"><span>#</span>{transactionId}</p>
						<p><span>Destination: </span>{transaction.destination}</p>
						<p><span>Amount: </span>{formatUnits(transaction.amount, 6)} USDT</p>
						<p><span>Number of confirmations: </span>{transaction.numConfirmations}</p>
						<p className={`status ${transaction.statusLabel.toLowerCase()}`}><span>Status: </span>{transaction.statusLabel}</p>
					</div>

					{transaction.status === 0 && (
						<div className="actions">
							{isOwner() && (
								<>
									<button className="execute" onClick={(event) => executeTransaction(event, transactionId)} disabled={transaction.numConfirmations !== project.financiers.length}>Execute</button>
									<button className="revoke" onClick={(event) => revokeTransaction(event, transactionId)}>Revoke</button>
								</>
							)}
							{isFinancier() && (
								!transaction.isSignedByMe && (
									<button className="sign" onClick={(event) => signTransaction(event, transactionId)}>Sign Transaction</button>
								) || (
									<p className="text-signed">You have signed</p>
								)
							)}
						</div>
					) || (
						transaction.isSignedByMe && (
							<p className="text-signed">You have signed</p>
						)
					)}
				</div>
			)}

			<NotificationPopup showNotificationPopup={showNotificationPopup} setShowNotificationPopup={setShowNotificationPopup} classes={notificationClasses.current}>
				{notificationText.current}
			</NotificationPopup>
		</>
	);
};

export default Transaction;
