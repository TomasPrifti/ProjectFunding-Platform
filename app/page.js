import Link from "next/link";

const Dashboard = () => {
	return (
		<div className="dashboard">
			<h1>ProjectFunding</h1>

			<p>Decentralized Crowdfunding Platform</p>

			<Link href="/newProject">
				New Project
			</Link>
		</div>
	);
}

export default Dashboard;
