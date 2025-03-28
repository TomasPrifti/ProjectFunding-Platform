import { formatUnits } from "ethers";
import Link from "next/link";
import EtherscanInfo from "@/components/etherscan-info";

const Project = ({ project, view = "card" }) => {
	const hrefData = {
		pathname: '/getProject',
		query: { address: project.address },
	};

	return (
		<>
			{view === "card" && (
				<Link href={hrefData} className="project view-card">
					<div>
						<h2 className="name">{project.name}</h2>
						<p className="description">{project.description}</p>
					</div>

					<div className="details">
						<p><span>Minimum capital to invest:</span> {formatUnits(project.minCapital, 6)} USDT</p>

						<p><span>Current balance:</span> {formatUnits(project.currentBalance, 6)} USDT</p>
					</div>
				</Link>
			)}
			{view === "full" && (
				<div className="project view-full">
					<div className="main-details">
						<h1 className="name">{project.name}</h1>

						<EtherscanInfo contractAddress={project.address} view="contract" />

						<p className="description">{project.description}</p>
					</div>

					<div className="details">
						<p><span>Address:</span> {project.address}</p>

						<p><span>Minimum capital to invest:</span> {formatUnits(project.minCapital, 6)} USDT</p>
						<p><span>Current balance:</span> {formatUnits(project.currentBalance, 6)} USDT</p>
					</div>
				</div>
			)}
		</>
	);
};

export default Project;
