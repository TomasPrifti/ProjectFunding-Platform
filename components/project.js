import { formatUnits } from "ethers";
import Link from "next/link";

const Project = ({ project, view = "card" }) => {
	const hrefData = {
		pathname: '/getProject',
		query: { address: project.address },
	};

	return (
		<>
			{view === "card" && (
				<Link href={hrefData} className="project view-card">
					<h2 className="name">{project.name}</h2>
					<p className="description">{project.description}</p>

					<div className="details">
						<p><span>Expiration time:</span> {new Date(parseInt(project.expiration) * 1000).toLocaleDateString()}</p>
						<p><span>Goal:</span> {formatUnits(project.goal, 6)} USDT</p>
						<p><span>Minimum capital to invest:</span> {formatUnits(project.minCapital, 6)} USDT</p>
						<p><span>Current capital invested:</span> {formatUnits(project.currentBalance, 6)} USDT</p>
						<p><span>Status:</span> {project.status}</p>
					</div>
				</Link>
			)}
			{view === "full" && (
				<div className="project view-full">
					<h1 className="name">{project.name}</h1>
					<p className="description">{project.description}</p>

					<div className="details">
						<div>
							<p><span>Expiration time:</span> {new Date(parseInt(project.expiration) * 1000).toLocaleDateString()}</p>
							<p><span>Goal:</span> {formatUnits(project.goal, 6)} USDT</p>
							<p><span>Minimum capital to invest:</span> {formatUnits(project.minCapital, 6)} USDT</p>
						</div>

						<div>
							<p><span>Address:</span> {project.address}</p>
							<p><span>Target wallet:</span> {project.targetWallet}</p>
						</div>

						<p><span>Current capital invested:</span> {formatUnits(project.currentBalance, 6)} USDT</p>

						<p><span>Status:</span> {project.status}</p>
					</div>
				</div>
			)}
		</>
	);
};

export default Project;
