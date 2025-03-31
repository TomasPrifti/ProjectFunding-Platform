import { formatUnits } from "ethers";
import Link from "next/link";
import EtherscanInfo from "@/components/etherscan-info";

const Project = ({ project, view = "card" }) => {
	const hrefData = {
		pathname: '/getProject',
		query: { address: project.address },
	};
	const hrefDataTransactions = {
		pathname: '/getProjectTransactions',
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
						<p><span>Number of transactions:</span> {project.transactionCount}</p>
						<p><span>Minimum capital to invest:</span> {formatUnits(project.minCapital, 6)} USDT</p>
						<p className="current-balance"><span>Current balance:</span> {formatUnits(project.currentBalance, 6)} USDT</p>
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
						<div>
							<p><span>Owner:</span> {project.owner}</p>
							<p><span>Address:</span> {project.address}</p>
						</div>

						<div>
							<p><span>Number of transactions:</span> {project.transactionCount}</p>
							<Link href={hrefDataTransactions}>
								See all Transactions
							</Link>
						</div>

						<p><span>Minimum capital to invest:</span> {formatUnits(project.minCapital, 6)} USDT</p>

						<span></span>

						<div>
							<p><span>Capital locked:</span> {formatUnits(project.capitalLocked, 6)} USDT</p>
							<p><span>Capital available:</span> {formatUnits(project.currentBalance - project.capitalLocked, 6)} USDT</p>
						</div>

						<p className="current-balance"><span>Current balance:</span> {formatUnits(project.currentBalance, 6)} USDT</p>
					</div>
				</div>
			)}
			{view === "reduced" && (
				<div className="project view-reduced">
					<h1 className="name">{project.name}</h1>

					<div className="details">
						<p><span>Owner:</span> {project.owner}</p>

						<span></span>

						<p><span>Number of transactions:</span> {project.transactionCount}</p>

						<span></span>

						{project.financiers.length !== 0 && (
							<p><span>Number of confirmations requested to execute:</span> {project.financiers.length}</p>
						) || (
								<p><span>There aren't financiers yet</span></p>
							)}

						<span></span>

						<div>
							<p><span>Capital locked:</span> {formatUnits(project.capitalLocked, 6)} USDT</p>
							<p><span>Capital available:</span> {formatUnits(project.capitalAvailable, 6)} USDT</p>
						</div>

						<p className="current-balance"><span>Current balance:</span> {formatUnits(project.currentBalance, 6)} USDT</p>
					</div>
				</div>
			)}
		</>
	);
};

export default Project;
