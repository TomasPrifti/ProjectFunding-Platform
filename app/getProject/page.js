"use client"

import { ethers } from "ethers";
import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { abi } from "@/constants/index";
import { UserContext } from "@/utils/context";
import Project from "@/components/project";

const GetProject = () => {
	const {
		user,
		setUser
	} = useContext(UserContext);

	const searchParams = useSearchParams();
	const [project, setProject] = useState();

	const getProjectData = async (address) => {
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
		// Retrieve the contract Project already deployed.
		const project = new ethers.Contract(address, abi[user.chainId]["Project"], signer)

		const obj = {
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

	useEffect(() => {
		const address = searchParams.get('address');
		if (!user?.chainId || !address) {
			return;
		}

		getProjectData(address);
	}, [user]);

	return (
		<div className="get-project">
			{project ? (
				<Project key={project.address} project={project} view="full"/>
			) : (
				<h1>This project doesn't exist !</h1>
			)}
		</div>
	);
}

export default GetProject;
