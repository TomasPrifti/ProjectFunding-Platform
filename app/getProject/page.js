"use client"

import { ethers, formatUnits } from "ethers";
import Form from "next/form"
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState, useActionState, useRef } from "react";
import { abi } from "@/constants/index";
import { UserContext } from "@/utils/context";
import Project from "@/components/project";
import NotificationPopup from "@/components/notification-popup";

const GetProject = () => {
	const {
		user,
		setUser
	} = useContext(UserContext);

	const searchParams = useSearchParams();
	const [project, setProject] = useState(null);
	const [signer, setSigner] = useState(null);

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

		let signer;

		try {
			const provider = new ethers.BrowserProvider(window.ethereum);
			signer = await provider.getSigner();
			setSigner(signer);
		} catch (error) {
			console.error("Error in wallet connection:", error);
			return;
		}
		// Retrieve the contract Project already deployed.
		const project = new ethers.Contract(address, abi[user.chainId]["Project"], signer)

		const obj = {
			contract: project,
			address: project.target,
			name: await project.getName(),
			description: await project.getDescription(),
			expiration: await project.getExpiration(),
			goal: await project.getGoal(),
			minCapital: await project.getMinCapital(),
			targetWallet: await project.getTargetWallet(),
			status: await project.getStatus(),
			currentBalance: await project.getUSDTBalance(),
			myCapitalInvested: await project.getMyCapitalInvested(),
		};

		setProject(obj);
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

		// TODO: manage sendTransaction to fund the Project.

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
	}, [user]);

	const [state, formAction] = useActionState(fundProject, {
		formData: new FormData(),
	});

	return (
		<div className="get-project">
			{project ? (
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
				</>
			) : (
				<h1>This project doesn't exist !</h1>
			)}
		</div>
	);
}

export default GetProject;
