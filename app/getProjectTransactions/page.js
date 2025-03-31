"use client"

import { ethers, formatUnits } from "ethers";
import Form from "next/form"
import Image from 'next/image';
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState, useActionState, useRef } from "react";
import { abi } from "@/constants/index";
import { UserContext } from "@/utils/context";
import Project from "@/components/project";
import Transaction from "@/components/transaction";
import NotificationPopup from "@/components/notification-popup";
import Loader from '@/components/loader';
import { validateField, performValidationCreateTransaction, resetClasses } from "@/utils/helper";

const getProjectTransactions = () => {
	const {
		user,
		setUser
	} = useContext(UserContext);

	const searchParams = useSearchParams();
	const [project, setProject] = useState(null);
	const [loading, setLoading] = useState(true);

	const [showNotificationPopup, setShowNotificationPopup] = useState(false);
	const notificationText = useRef("");
	const notificationClasses = useRef("");

	const notifyUser = (text = "Something happen", classes = "") => {
		setShowNotificationPopup(true);
		notificationText.current = text;
		notificationClasses.current = classes;
	}

	const getProjectData = async (address) => {
		if (typeof window.ethereum === "undefined") {
			console.error("MetaMask doesn't exist.");
			return;
		}

		const provider = user.provider;
		const signer = user.signer;

		try {
			// Check if the contract Project exist.
			const contractCode = await provider.getCode(address);
			if (contractCode === "0x") {
				console.error("Error: The project contract doesn't exist");
				notifyUser("Error: The project contract doesn't exist", "error");
				setLoading(false);
				return;
			}
		} catch (error) {
			console.error("Error: The project contract doesn't exist:", error);
			notifyUser("Error: The project contract doesn't exist", "error");
			setLoading(false);
			return;
		}
		// Retrieve the contract Project already deployed.
		const project = new ethers.Contract(address, abi[user.chainId]["Project"], signer);

		try {
			const obj = {
				contract: project,
				address: project.target,
				name: await project.getName(),
				owner: await project.getOwner(),
				currentBalance: await project.getUSDTBalance(),
				transactionCount: parseInt(await project.getTransactionCount()),
				capitalLocked: await project.getCapitalLocked(),
				financiers: (await project.getFinanciers()).toArray()
			};
			obj.capitalAvailable = obj.currentBalance - obj.capitalLocked;

			// Retrieving all the project's transactions.
			const tempArray = [];
			let rawTransaction;
			for (let index = 0; index < obj.transactionCount; index++) {
				rawTransaction = await project.getTransaction(index);

				const transaction = {
					destination: rawTransaction[0],
					amount: rawTransaction[1],
					executed: rawTransaction[2],
					numConfirmations: parseInt(rawTransaction[3]),
					status: parseInt(rawTransaction[4]),
					statusLabel: await project.TransactionStatusLabel(rawTransaction[4]),
					isSignedByMe: await project.isTransactionSignedByMe(index)
				}
				tempArray.push(transaction);
			}
			obj.transactions = tempArray;

			setProject(obj);
		} catch (error) {
			console.error("Error in contract retrieved:", error);
		} finally {
			setLoading(false);
		}
	}

	const createTransaction = async (previousState, formData) => {
		if (typeof window.ethereum === "undefined") {
			console.error("MetaMask doesn't exist.");
			notifyUser("MetaMask doesn't exist.", "error");

			return {
				formData,
			};
		}

		if (user.signer.address !== project.owner) {
			console.error("Only the owner is able to create a transaction");
			notifyUser("Only the owner is able to create a transaction", "error");

			return {
				formData,
			};
		}

		// Define the parameters to create a new Transaction.
		const args = {
			destination: formData.get("destination"),
			amount: formData.get("amount"),
			capitalAvailable: project.capitalAvailable,
		};

		// Validate and Convert data.
		const result = performValidationCreateTransaction(args);
		if (!result) {
			notifyUser("Inputs not valid", "error");

			return {
				formData,
			};
		}

		try {
			// Sending transaction.
			const transactionResponse = await project.contract.createTransaction(
				args.destination,
				args.amount,
			);

			// Awaiting confirmations.
			const transactionReceipt = await transactionResponse.wait();
		} catch (error) {
			console.error("Error in sending transaction:", error);
			notifyUser("Error in sending transaction", "error");

			return {
				formData,
			};
		}

		// Updating Project's information.
		project.currentBalance = await project.contract.getUSDTBalance();
		project.capitalLocked = await project.contract.getCapitalLocked();
		project.capitalAvailable = project.currentBalance - project.capitalLocked;
		project.transactionCount = parseInt(await project.contract.getTransactionCount());

		// Updating Project's transactions.
		const rawTransaction = await project.contract.getTransaction(project.transactionCount - 1);
		const transaction = {
			destination: rawTransaction[0],
			amount: rawTransaction[1],
			executed: rawTransaction[2],
			numConfirmations: parseInt(rawTransaction[3]),
			status: parseInt(rawTransaction[4]),
			statusLabel: await project.contract.TransactionStatusLabel(rawTransaction[4]),
			isSignedByMe: await project.contract.isTransactionSignedByMe(project.transactionCount - 1)
		}
		project.transactions.push(transaction);

		setProject(project);

		// Updating User's information.
		user.balanceETH = await user.provider.getBalance(user.address);
		setUser({
			...user,
			balanceETH: user.balanceETH,
		});

		resetClasses();
		notifyUser("Transaction created successfully", "success");

		return {
			formData: new FormData(),
		};
	}

	const reloadTransactions = async () => {
		project.transactionCount = parseInt(await project.contract.getTransactionCount());

		// Retrieving all the project's transactions.
		const tempArray = [];
		let rawTransaction;
		for (let index = 0; index < project.transactionCount; index++) {
			rawTransaction = await project.contract.getTransaction(index);

			const transaction = {
				destination: rawTransaction[0],
				amount: rawTransaction[1],
				executed: rawTransaction[2],
				numConfirmations: parseInt(rawTransaction[3]),
				status: parseInt(rawTransaction[4]),
				statusLabel: await project.contract.TransactionStatusLabel(rawTransaction[4]),
				isSignedByMe: await project.contract.isTransactionSignedByMe(index)
			}
			tempArray.push(transaction);
		}
		project.transactions = tempArray;

		setProject({ ...project });
	}

	useEffect(() => {
		const address = searchParams.get('address');
		if (!user?.chainId || !address) {
			return;
		}

		getProjectData(address);
	}, [user?.chainId]);

	const [state, formAction] = useActionState(createTransaction, {
		formData: new FormData(),
	});

	return (
		<div className="get-project-transactions">
			{user?.address ? (
				<>
					{loading && <Loader /> || (
						project ? (
							<>
								<Project key={project.address} project={project} view="reduced" />

								{user.signer.address === project.owner && parseInt(project.capitalAvailable) !== 0 && (
									<Form action={formAction} className="fields">
										<div>
											<div className="field field-destination">
												<label htmlFor="destination">Specify destination:</label>
												<input type="text" id="destination" name="destination" onChange={validateField} defaultValue={state.formData.get("destination")} />
											</div>

											<div className="field field-amount">
												<label htmlFor="amount">How much USDT would you like to send?</label>
												<input type="number" id="amount" name="amount" step="1" min="1" onChange={(event) => validateField(event, project.capitalAvailable)} defaultValue={state.formData.get("amount")} />
											</div>
										</div>

										<button type="submit" disabled={!user?.address}>Create Transaction</button>
									</Form>
								)}

								<div className="container-transactions">
									<div className="title-container">
										<h2>Transactions ({project.transactionCount})</h2>

										<Image
											src="/reload.png"
											width={35}
											height={35}
											alt="Reload Transactions History"
											onClick={reloadTransactions}
										/>
									</div>

									<div className="list-transactions">
										{project.transactions.map((transaction, index) => {
											return (
												<Transaction key={index} transactionId={index} transaction={transaction} project={project} view="row" />
											);
										})}
									</div>
								</div>

								<NotificationPopup showNotificationPopup={showNotificationPopup} setShowNotificationPopup={setShowNotificationPopup} classes={notificationClasses.current}>
									{notificationText.current}
								</NotificationPopup>
							</>
						) : (
							<h1>This project doesn't exist !</h1>
						)
					)}
				</>
			) : (
				<h2>Connect wallet to see the transactions</h2>
			)}
		</div>
	);
}

export default getProjectTransactions;
