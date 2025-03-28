"use client"

import { ethers } from "ethers";
import { useContext, useEffect, useState } from "react";
import { contractAddresses, abi } from "@/constants/index";
import { UserContext } from "@/utils/context";
import Project from "@/components/project";
import Loader from '@/components/loader';

const ListProjects = () => {
	const {
		user,
		setUser
	} = useContext(UserContext);

	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);

	const getAllProjects = async () => {
		if (typeof window.ethereum === "undefined") {
			console.error("MetaMask doesn't exist.");
			return;
		}

		const provider = user.provider;

		try {
			// Check if the contract Manager is deployed.
			const contractCode = await provider.getCode(contractAddresses[user.chainId]["Manager"]);
			if (contractCode === "0x") {
				console.error("Error: The main contract doesn't exist");
				return;
			}
		} catch (error) {
			console.error("Error in wallet connection:", error);
			return;
		}
		// Retrieve the contract Manager already deployed.
		const manager = new ethers.Contract(contractAddresses[user.chainId]["Manager"], abi[user.chainId]["Manager"], provider)
		const allProjectsAddresses = await manager.getAllProjects();
		const tempProjects = [];

		for (const address of allProjectsAddresses) {
			const project = new ethers.Contract(address, abi[user.chainId]["Project"], provider)

			const obj = {
				address: project.target,
				name: await project.getName(),
				description: await project.getDescription(),
				minCapital: await project.getMinCapital(),
				currentBalance: await project.getUSDTBalance()
			};

			tempProjects.push(obj);
		}

		setProjects(tempProjects);
		setLoading(false);
	}

	useEffect(() => {
		if (!user?.chainId) {
			return;
		}
		if (contractAddresses[user.chainId]["Manager"] === "") {
			return;
		}

		getAllProjects();
	}, [user]);

	return (
		<div className="list-projects">
			<h1>All Projects</h1>

			{user?.address ? (
				<>
					{loading && <Loader /> || (
						projects.length > 0 ? (
							<div className="grid-projects">
								{projects.map((project) => {
									return (
										<Project key={project.address} project={project} view="card" />
									);
								})}
							</div>
						) : (
							<h2>No projects currently available</h2>
						)
					)}
				</>
			) : (
				<h2>Connect wallet to see all the projects available</h2>
			)}
		</div>
	);
}

export default ListProjects;
