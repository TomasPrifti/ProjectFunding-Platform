"use client"

import { ethers, formatUnits } from "ethers";
import Form from "next/form"
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState, useActionState, useRef } from "react";
import { contractAddresses, abi } from "@/constants/index";
import { UserContext } from "@/utils/context";
import Project from "@/components/project";
import NotificationPopup from "@/components/notification-popup";
import EtherscanInfo from "@/components/etherscan-info";
import Loader from '@/components/loader';

const GetProject = () => {
	const {
		user,
		setUser
	} = useContext(UserContext);

	const searchParams = useSearchParams();
	const [project, setProject] = useState(null);
	const [usdt, setUsdt] = useState(null);
	const [loading, setLoading] = useState(true);

	const buttonLabel = user?.address ? "Fund Project" : "NOT CONNECTED";
	const buttonClass = user?.address ? "" : "error";
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
				return;
			}
		} catch (error) {
			console.error("Error: The project contract doesn't exist:", error);
			notifyUser("Error: The project contract doesn't exist", "error");
			return;
		}
		// Retrieve the contract Project already deployed.
		const project = new ethers.Contract(address, abi[user.chainId]["Project"], signer);
		const usdt = new ethers.Contract(contractAddresses[user.chainId]["USDT"], abi[user.chainId]["USDT"], signer);

		try {
			const obj = {
				contract: project,
				address: project.target,
				name: await project.getName(),
				description: await project.getDescription(),
				minCapital: await project.getMinCapital(),
				owner: await project.getOwner(),
				currentBalance: await project.getUSDTBalance(),
				myCapitalInvested: await project.getMyCapitalInvested(),
				transactionCount: await project.getTransactionCount()
			};
			setUsdt(usdt);
			setProject(obj);
		} catch (error) {
			console.error("Error in contract retrieved:", error);
		} finally {
			setLoading(false);
		}
	}

	const fundProject = async (previousState, formData) => {
		if (typeof window.ethereum === "undefined") {
			console.error("MetaMask doesn't exist.");
			notifyUser("MetaMask doesn't exist.", "error");

			return {
				formData,
			};
		}

		// Define the parameters to fund the Project.
		const args = {
			capitalToInvest: formData.get("capital-to-invest"),
		};

		// Validation.
		const inputField = document.getElementById('capital-to-invest');
		inputField.className = "valid";
		if (!args.capitalToInvest || args.capitalToInvest < 1 || !project.minCapital || args.capitalToInvest < parseInt(formatUnits(project.minCapital, 6))) {
			notifyUser("Inputs not valid", "error");
			inputField.className = "error";

			return {
				formData,
			};
		}

		args.capitalToInvest = args.capitalToInvest * 10 ** 6; // Conversion in USDT.

		try {
			// Approving user's allowance.
			await usdt.approve(project.address, args.capitalToInvest);

			// Sending transaction.
			const transactionResponse = await project.contract.fundProject(
				args.capitalToInvest,
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
		project.myCapitalInvested = await project.contract.getMyCapitalInvested();
		setProject(project);

		// Updating User's information.
		user.balanceETH = await user.provider.getBalance(user.address);
		user.balanceUSDT = await usdt.balanceOf(user.address);
		setUser({
			...user,
			balanceETH: user.balanceETH,
			balanceUSDT: user.balanceUSDT,
		});

		inputField.className = "";
		notifyUser("Project funded successfully", "success");

		return {
			formData: new FormData(),
		};
	}

	const validateValue = (event) => {
		const inputValue = parseInt(event.target.value);
		event.target.className = "valid";
		if (!inputValue || inputValue < 1 || !project.minCapital || inputValue < parseInt(formatUnits(project.minCapital, 6))) {
			event.target.className = "error";
		}
	}

	useEffect(() => {
		const address = searchParams.get('address');
		if (!user?.chainId || !address) {
			return;
		}

		getProjectData(address);
	}, [user?.chainId]);

	const [state, formAction] = useActionState(fundProject, {
		formData: new FormData(),
	});

	return (
		<div className="get-project">
			{loading && <Loader /> || (
				project ? (
					<>
						<Project key={project.address} project={project} view="full" />

						<Form action={formAction} className="fields">
							<div>
								<p><span>I've invested:</span> {formatUnits(project.myCapitalInvested, 6)} USDT</p>

								<div className="field field-capital-to-invest">
									<label htmlFor="capital-to-invest">How much USDT would you like to invest?</label>
									<input type="number" id="capital-to-invest" name="capital-to-invest" step="1" min="1" onChange={validateValue} defaultValue={state.formData.get("capital-to-invest")} />
								</div>
							</div>

							<button type="submit" className={buttonClass} disabled={!user?.address}>{buttonLabel}</button>
						</Form>

						<NotificationPopup showNotificationPopup={showNotificationPopup} setShowNotificationPopup={setShowNotificationPopup} classes={notificationClasses.current}>
							{notificationText.current}
						</NotificationPopup>

						<EtherscanInfo contractAddress={project.address} view="transactions" />
					</>
				) : (
					<h1>This project doesn't exist !</h1>
				)
			)}
		</div>
	);
}

export default GetProject;
