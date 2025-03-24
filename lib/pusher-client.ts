"use client";

import Pusher from "pusher-js";

// Using the provided Pusher credentials directly in the code
const PUSHER_KEY = "e089376087cac1a62785";
const PUSHER_CLUSTER = "ap1";

export function initializePusher(
	token: string,
	organizationId: string,
	onDeposit: (data: any) => void
) {
	const pusherClient = new Pusher(PUSHER_KEY, {
		cluster: PUSHER_CLUSTER,
		authorizer: (channel) => ({
			authorize: async (socketId, callback) => {
				try {
					const response = await fetch("/api/notifications/auth", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({
							socket_id: socketId,
							channel_name: channel.name,
						}),
					});

					if (response.ok) {
						const data = await response.json();
						callback(null, data);
					} else {
						callback(new Error("Pusher authentication failed"), null);
					}
				} catch (error) {
					console.error("Pusher authorization error:", error);
					callback(error as Error, null);
				}
			},
		}),
	});

	// Subscribe to organization's private channel
	const channel = pusherClient.subscribe(`private-org-${organizationId}`);

	channel.bind("pusher:subscription_succeeded", () => {
		console.log("Successfully subscribed to private channel");
	});

	channel.bind("pusher:subscription_error", (error: any) => {
		console.error("Subscription error:", error);
	});

	// Bind to the deposit event
	channel.bind("deposit", (data: any) => {
		console.log("Deposit event received:", data);
		onDeposit(data);
	});

	return pusherClient;
}
