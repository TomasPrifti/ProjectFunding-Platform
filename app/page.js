import Link from "next/link";

const Dashboard = () => {
	return (
		<div className="dashboard">
			<h1>ProjectFunding</h1>
			<h2>Decentralized Crowdfunding Platform</h2>

			<p>A Decentralized Platform where anyone can create their own Project and fund that of others</p>

			<em>~ “Empowering Ideas Through Decentralized Crowdfunding”</em>

			<Link href="/newProject">
				New Project
			</Link>
		</div>
	);
}

export default Dashboard;
