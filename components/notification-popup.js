import Image from 'next/image';
import { useEffect } from "react";

const NotificationPopup = ({ children, showNotificationPopup, setShowNotificationPopup, classes }) => {
	const delay = 3000; // 3 seconds.

	useEffect(() => {
		if (!showNotificationPopup) {
			return;
		}
		setTimeout(() => {
			setShowNotificationPopup(false);
		}, delay);
	}, [showNotificationPopup]);

	return (
		<div className={`notification-popup ${classes} ${showNotificationPopup ? "show" : ""}`}>
			<div>
				{children}
			</div>

			<Image
				src={`/${classes}.png`}
				width={50}
				height={50}
				alt={classes}
			/>
		</div>
	);
};

export default NotificationPopup;
