import { formatUnits } from "ethers";
import Link from "next/link";

const ProjectCard = ({ project }) => {
	const hrefData = {
		pathname: '/getProject',
		query: { address: project.address },
	};

	return (
		<Link href={hrefData} className="project-card">
			<h2 className="name">{project.name}</h2>
			<p className="description">{project.description}</p>

			<div className="details">
				<p><span>Address:</span> {project.address.slice(0, 6)}...{project.address.slice(-4)}</p>
				<p><span>Expiration time:</span> {new Date(parseInt(project.expiration) * 1000).toLocaleDateString()}</p>
				<p><span>Goal:</span> {formatUnits(project.goal, 6)} USDT</p>
				<p><span>Minimum capital to invest:</span> {formatUnits(project.minCapital, 6)} USDT</p>
				<p><span>Current capital invested:</span> {formatUnits(project.currentBalance, 6)} USDT</p>
				<p><span>How much I've invested:</span> {formatUnits(project.myCapitalInvested, 6)} USDT</p>
				<p><span>Target wallet:</span> {project.targetWallet.slice(0, 6)}...{project.targetWallet.slice(-4)}</p>
				<p><span>Status:</span> {project.status}</p>
			</div>
		</Link>
	);
};

export default ProjectCard;
