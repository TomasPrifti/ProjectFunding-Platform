'use client'

import { ethers } from "ethers";
import Form from 'next/form'
import { useContext } from 'react';
import { contractAddresses, abi } from '@/constants/index';
import { UserContext } from '@/utils/context';

const NewProject = () => {
	const {
		user,
		setUser
	} = useContext(UserContext);

	const buttonLabel = user?.address ? "Create Project" : "NOT CONNECTED";
	const buttonClass = user?.address ? "" : "error";

	const createProject = async (formData) => {
		if (typeof window.ethereum === "undefined") {
			console.error("MetaMask doesn't exist.");
			return;
		}

		let signer;

		try {
			const provider = new ethers.BrowserProvider(window.ethereum);
			signer = await provider.getSigner();
		} catch (error) {
			console.error("Error in wallet connection:", error);
			return;
		}
		// Retrieve the contract Manager already deployed.
		const manager = new ethers.Contract(contractAddresses['31337'], abi['31337'], signer)

		// Define the parameters to create the new Project.
		const args = {};
		args.name = formData.get("name");
		args.description = formData.get("description");
		args.expiration = formData.get("expiration");
		args.goal = formData.get("goal");
		args.minCapital = formData.get("min-capital");

		// Validate and Convert data.
		const result = performValidation(args);
		if (!result) {
			return;
		}

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
	}

	const performValidation = (args) => {
		// Check Name.
		if (!args.name || args.name.trim().length === 0) {
			console.log("Error: value not valid for -> Name");
			return false;
		}

		// Check Description.
		if (!args.description || args.description.trim().length === 0) {
			console.log("Error: value not valid for -> Description");
			return false;
		}

		// Check Expiration.
		if (!args.expiration || args.expiration < 1) {
			console.log("Error: value not valid for -> Expiration");
			return false;
		}

		// Check Goal.
		if (!args.goal || args.goal < 1) {
			console.log("Error: value not valid for -> Goal");
			return false;
		}

		// Check Minimum Capital.
		if (!args.minCapital || args.minCapital < 1 || args.minCapital > args.goal) {
			console.log("Error: value not valid for -> Minimum Capital");
			return false;
		}

		// Manipulations.
		args.name = args.name.trim();
		args.description = args.description.trim();
		args.expiration = args.expiration * 24 * 60 * 60; // Conversion in seconds.
		args.goal = args.goal * 10 ** 6; // Conversion in USDT.
		args.minCapital = args.minCapital * 10 ** 6; // Conversion in USDT.

		return true;
	}

	return (
		<div className="new-project">
			<h1>Create Your New Project</h1>

			<Form action={createProject} className="fields">
				<div className="field field-name">
					<label htmlFor="name">Name</label>
					<input type="text" id="name" name="name" />
				</div>

				<div className="field field-description">
					<label htmlFor="description">Description</label>
					<textarea id="description" name="description" rows="3" cols="35" />
				</div>

				<div className="field field-expiration">
					<label htmlFor="expiration">Expiration Time(specify days)</label>
					<input type="number" id="expiration" name="expiration" step="1" min="1" />
				</div>

				<div className="field field-goal">
					<label htmlFor="goal">Goal (specify USDT)</label>
					<input type="number" id="goal" name="goal" step="1" min="1" />
				</div>

				<div className="field field-min-capital">
					<label htmlFor="min-capital">Minimum Capital to Invest (specify USDT)</label>
					<input type="number" id="min-capital" name="min-capital" step="1" min="1" />
				</div>

				<button type="submit" className={buttonClass} disabled={!user?.address}>{buttonLabel}</button>
			</Form>

		</div>
	);
}

export default NewProject;
