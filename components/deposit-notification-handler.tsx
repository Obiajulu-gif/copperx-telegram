"use client";

import { useEffect, useState } from "react";
import { initializePusher } from "@/lib/pusher-client";

interface DepositNotificationHandlerProps {
	token: string;
	organizationId: string;
	telegramBotToken: string;
	chatId: number;
}

export function DepositNotificationHandler({
	token,
	organizationId,
	telegramBotToken,
	chatId,
}: DepositNotificationHandlerProps) {
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		if (!token || !organizationId || !telegramBotToken || !chatId) {
			console.log("Missing required props for notification handler");
			return;
		}

		const handleDeposit = async (data: any) => {
			console.log("Deposit received:", data);

			try {
				// Send notification to Telegram
				const message =
					`💰 *New Deposit Received*\n\n` +
					`Amount: ${data.amount} ${data.currency}\n` +
					`Network: ${data.network}\n` +
					`Status: ${data.status}\n\n` +
					`Transaction ID: ${data.transactionId}`;

				await fetch(
					`https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							chat_id: chatId,
							text: message,
							parse_mode: "Markdown",
						}),
					}
				);
			} catch (error) {
				console.error("Error sending Telegram notification:", error);
			}
		};

		const pusherClient = initializePusher(token, organizationId, handleDeposit);
		setConnected(true);

		return () => {
			pusherClient.disconnect();
			setConnected(false);
		};
	}, [token, organizationId, telegramBotToken, chatId]);

	return null; // This component doesn't render anything
}
