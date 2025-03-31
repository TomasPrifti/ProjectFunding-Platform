import { formatUnits } from "ethers";
import { useContext } from "react";
import { UserContext } from "@/utils/context";

const Transaction = ({ transactionId, transaction, project, view = "row" }) => {
	const {
		user,
		setUser
	} = useContext(UserContext);

	const executeTransaction = () => {
		console.log('execute');
	}

	const revokeTransaction = () => {
		console.log('revoke');
	}

	const signTransaction = () => {
		console.log('sign');
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
									<button className="execute" onClick={executeTransaction}>Execute</button>
									<button className="revoke" onClick={revokeTransaction}>Revoke</button>
								</>
							)}
							{isFinancier() && (
								<button className="sign" onClick={signTransaction}>Sign Transaction</button>
							)}
						</div>
					)}
				</div>
			)}
		</>
	);
};

export default Transaction;
