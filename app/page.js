import Link from "next/link";

const Dashboard = () => {
	const backgroundImageStyle = {
		backgroundImage: 'url(./dashboard.png)',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		height: '100vh',
	};

	return (
		<main
			className="dashboard"
			style={backgroundImageStyle}
		>
			<div className="overlay">
				<div className="container">
					<h1>ProjectFunding</h1>

					<p>Decentralized Crowdfunding Platform</p>

					<Link href="/newProject">
						New Project
					</Link>
				</div>
			</div>
		</main>
	);
}

export default Dashboard;
