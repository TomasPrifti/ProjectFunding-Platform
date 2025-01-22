'use client'

import { ethers } from "ethers";
import Form from 'next/form'
import { useContext, useActionState } from 'react';
import { contractAddresses, abi } from '@/constants/index';
import { UserContext } from '@/utils/context';
import { validateField, performValidation } from '@/utils/helper';

const NewProject = () => {
	const {
		user,
		setUser
	} = useContext(UserContext);

	const buttonLabel = user?.address ? "Create Project" : "NOT CONNECTED";
	const buttonClass = user?.address ? "" : "error";

	const createProject = async (previousState, formData) => {
		if (typeof window.ethereum === "undefined") {
			console.error("MetaMask doesn't exist.");
			return {
				formData,
			};
		}

		let signer;

		try {
			const provider = new ethers.BrowserProvider(window.ethereum);
			signer = await provider.getSigner();

			// Check if the contract Manager is deployed.
			const contractCode = await provider.getCode(contractAddresses['31337']);
			if (contractCode === "0x") {
				console.error("Error: The main contract doesn't exist");
				return {
					formData,
				};
			}
		} catch (error) {
			console.error("Error in wallet connection:", error);
			return {
				formData,
			};
		}
		// Retrieve the contract Manager already deployed.
		const manager = new ethers.Contract(contractAddresses['31337'], abi['31337'], signer)

		// Define the parameters to create the new Project.
		const args = {};
		args.name = formData.get("name");
		args.description = formData.get("description");
		args.expiration = parseInt(formData.get("expiration"));
		args.goal = parseInt(formData.get("goal"));
		args.minCapital = parseInt(formData.get("min-capital"));

		// Validate and Convert data.
		const result = performValidation(args);
		if (!result) {
			return {
				formData,
			};
		}

		try {
			// Sending transaction.
			const transactionResponse = await manager.createProject(
				args.name,
				args.description,
				args.expiration,
				args.goal,
				args.minCapital,
			);
			console.log(transactionResponse);

			// Awaiting confirmations.
			const transactionReceipt = await transactionResponse.wait();
			console.log(transactionReceipt);
		} catch (error) {
			console.error("Error in sending transaction:", error);
			return {
				formData,
			};
		}

		return {
			formData: new FormData(),
		};
	}

	const [state, formAction] = useActionState(createProject, {
		formData: new FormData(),
	});

	return (
		<div className="new-project">
			<h1>Create Your New Project</h1>

			<Form action={formAction} className="fields">
				<div className="field field-name">
					<label htmlFor="name">Name</label>
					<input type="text" id="name" name="name" onChange={validateField} defaultValue={state.formData.get("name")} />
				</div>

				<div className="field field-description">
					<label htmlFor="description">Description</label>
					<textarea id="description" name="description" rows="3" cols="35" onChange={validateField} defaultValue={state.formData.get("description")} />
				</div>

				<div className="field field-expiration">
					<label htmlFor="expiration">Expiration Time(specify days)</label>
					<input type="number" id="expiration" name="expiration" step="1" min="1" onChange={validateField} defaultValue={state.formData.get("expiration")} />
				</div>

				<div className="field field-goal">
					<label htmlFor="goal">Goal (specify USDT)</label>
					<input type="number" id="goal" name="goal" step="1" min="1" onChange={validateField} defaultValue={state.formData.get("goal")} />
				</div>

				<div className="field field-min-capital">
					<label htmlFor="min-capital">Minimum Capital to Invest (specify USDT)</label>
					<input type="number" id="min-capital" name="min-capital" step="1" min="1" onChange={validateField} defaultValue={state.formData.get("min-capital")} />
				</div>

				<button type="submit" className={buttonClass} disabled={!user?.address}>{buttonLabel}</button>
			</Form>

		</div>
	);
}

export default NewProject;
