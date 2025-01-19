import Link from "next/link";
import Image from 'next/image'

import Wallet from '@/components/wallet';

const Header = () => {
	return (
		<header className="header">
			<nav>
				<Link href="/" className="link-logo">
					<Image
						src="/logo.png"
						width={50}
						height={50}
						alt="ProjectFunding - Logo"
					/>
					ProjectFunding
				</Link>

				<Link href="/newProject">
					<button className="">Create a Project</button>
				</Link>
				<Link href="/listProjects">
					<button className="">See all the Projects</button>
				</Link>

				<Wallet />
			</nav>
		</header>
	);
};

export default Header;
