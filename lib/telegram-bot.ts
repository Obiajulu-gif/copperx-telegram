import { CopperxAPI } from "./copperx-api";

interface TelegramUpdate {
	update_id: number;
	message?: {
		message_id: number;
		from: {
			id: number;
			first_name: string;
			username?: string;
		};
		chat: {
			id: number;
			type: string;
		};
		date: number;
		text?: string;
	};
	callback_query?: {
		id: string;
		from: {
			id: number;
			first_name: string;
			username?: string;
		};
		message: {
			message_id: number;
			chat: {
				id: number;
				type: string;
			};
		};
		data: string;
	};
}

interface InlineKeyboardButton {
	text: string;
	callback_data?: string;
	url?: string;
}

export class TelegramBot {
	private token: string;
	private api: CopperxAPI;
	private userSessions: Map<number, UserSession>;

	constructor(token: string) {
		this.token = token;
		this.api = new CopperxAPI();
		this.userSessions = new Map();
	}

	async handleUpdate(update: TelegramUpdate) {
		try {
			if (update.message && update.message.text) {
				await this.handleMessage(update.message);
			} else if (update.callback_query) {
				await this.handleCallbackQuery(update.callback_query);
			}
		} catch (error) {
			console.error("Error handling update:", error);
		}
	}

	private async handleMessage(message: TelegramUpdate["message"]) {
		if (!message || !message.text) return;

		const chatId = message.chat.id;
		const text = message.text;
		const userId = message.from.id;

		// Get or create user session
		const session = this.getUserSession(userId);

		// Handle commands
		if (text.startsWith("/")) {
			const command = text.split(" ")[0].substring(1);
			const args = text.split(" ").slice(1);

			switch (command) {
				case "start":
					await this.handleStartCommand(chatId, userId);
					break;
				case "login":
					await this.handleLoginCommand(chatId, session);
					break;
				case "balance":
					await this.handleBalanceCommand(chatId, session);
					break;
				case "send":
					await this.handleSendCommand(chatId, session, args);
					break;
				case "withdraw":
					await this.handleWithdrawCommand(chatId, session, args);
					break;
				case "deposit":
					await this.handleDepositCommand(chatId, session);
					break;
				case "history":
					await this.handleHistoryCommand(chatId, session);
					break;
				case "help":
					await this.handleHelpCommand(chatId);
					break;
				default:
					await this.sendMessage(
						chatId,
						"Unknown command. Type /help for available commands."
					);
			}
		} else {
			// Handle conversation state
			if (session.awaitingInput) {
				await this.handleUserInput(chatId, userId, text, session);
			} else {
				await this.sendMessage(
					chatId,
					"I don't understand. Please use a command like /balance or /help to see all available commands."
				);
			}
		}
	}

	private async handleCallbackQuery(query: TelegramUpdate["callback_query"]) {
		if (!query) return;

		const chatId = query.message.chat.id;
		const userId = query.from.id;
		const data = query.data;
		const session = this.getUserSession(userId);

		// Answer callback query to remove loading state
		await this.answerCallbackQuery(query.id);

		// Process callback data
		const [action, ...params] = data.split(":");

		switch (action) {
			case "login":
				await this.promptForEmail(chatId, session);
				break;
			case "wallet":
				await this.handleWalletSelection(chatId, session, params[0]);
				break;
			case "confirm_send":
				await this.handleConfirmSend(chatId, session);
				break;
			case "confirm_withdraw":
				await this.handleConfirmWithdraw(chatId, session);
				break;
			case "cancel":
				await this.handleCancel(chatId, session);
				break;
			default:
				await this.sendMessage(chatId, "Unknown action");
		}
	}

	private async handleStartCommand(chatId: number, userId: number) {
		const session = this.getUserSession(userId);
		session.reset();

		await this.sendMessage(
			chatId,
			"👋 *Welcome to Copperx Payout Bot!*\n\n" +
				"I can help you manage your Copperx account directly from Telegram.\n\n" +
				"To get started, please login to your account.",
			{
				reply_markup: {
					inline_keyboard: [
						[{ text: "🔑 Login", callback_data: "login" }],
						[{ text: "❓ Help", callback_data: "help" }],
					],
				},
			}
		);
	}

	private async handleLoginCommand(chatId: number, session: UserSession) {
		await this.promptForEmail(chatId, session);
	}

	private async promptForEmail(chatId: number, session: UserSession) {
		session.awaitingInput = "email";
		await this.sendMessage(chatId, "Please enter your Copperx email address:");
	}

	private async handleBalanceCommand(chatId: number, session: UserSession) {
		if (!session.isAuthenticated) {
			await this.sendMessage(
				chatId,
				"You need to login first. Use /login to authenticate."
			);
			return;
		}

		try {
			const wallets = await this.api.getWallets(session.token);
			const balances = await this.api.getBalances(session.token);

			if (!wallets.length) {
				await this.sendMessage(chatId, "You don't have any wallets yet.");
				return;
			}

			let message = "💰 *Your Wallet Balances*\n\n";

			wallets.forEach((wallet) => {
				const walletBalance = balances.find((b) => b.walletId === wallet.id);
				message += `*${wallet.name}* (${wallet.network})\n`;
				message += `Balance: ${
					walletBalance ? walletBalance.balance : "0.00"
				} USDC\n\n`;
			});

			await this.sendMessage(chatId, message);
		} catch (error) {
			console.error("Error fetching balances:", error);
			await this.sendMessage(
				chatId,
				"Sorry, I couldn't fetch your balances. Please try again later."
			);
		}
	}

	private async handleSendCommand(
		chatId: number,
		session: UserSession,
		args: string[]
	) {
		if (!session.isAuthenticated) {
			await this.sendMessage(
				chatId,
				"You need to login first. Use /login to authenticate."
			);
			return;
		}

		if (args.length === 0) {
			session.awaitingInput = "send_email";
			await this.sendMessage(
				chatId,
				"Please enter the recipient's email address:"
			);
		} else if (args.length === 1) {
			session.transferData = { recipient: args[0] };
			session.awaitingInput = "send_amount";
			await this.sendMessage(
				chatId,
				`Sending to: ${args[0]}\nPlease enter the amount in USDC:`
			);
		} else {
			session.transferData = {
				recipient: args[0],
				amount: Number.parseFloat(args[1]),
			};
			await this.confirmSendTransaction(chatId, session);
		}
	}

	private async confirmSendTransaction(chatId: number, session: UserSession) {
		if (
			!session.transferData ||
			!session.transferData.recipient ||
			!session.transferData.amount
		) {
			await this.sendMessage(
				chatId,
				"Missing transaction details. Please try again."
			);
			return;
		}

		await this.sendMessage(
			chatId,
			`📤 *Confirm Transaction*\n\n` +
				`Recipient: ${session.transferData.recipient}\n` +
				`Amount: ${session.transferData.amount} USDC\n\n` +
				`Please confirm this transaction:`,
			{
				reply_markup: {
					inline_keyboard: [
						[{ text: "✅ Confirm", callback_data: "confirm_send" }],
						[{ text: "❌ Cancel", callback_data: "cancel" }],
					],
				},
			}
		);
	}

	private async handleConfirmSend(chatId: number, session: UserSession) {
		if (!session.transferData || !session.isAuthenticated) {
			await this.sendMessage(
				chatId,
				"Transaction details missing or session expired."
			);
			return;
		}

		try {
			await this.sendMessage(chatId, "Processing your transaction...");

			const result = await this.api.sendFunds(
				session.token,
				session.transferData.recipient,
				session.transferData.amount
			);

			await this.sendMessage(
				chatId,
				`✅ *Transaction Successful*\n\n` +
					`You've sent ${session.transferData.amount} USDC to ${session.transferData.recipient}\n` +
					`Transaction ID: ${result.transferId}`
			);

			// Reset transfer data
			session.transferData = null;
		} catch (error) {
			console.error("Error sending funds:", error);
			await this.sendMessage(
				chatId,
				"❌ *Transaction Failed*\n\n" +
					"Sorry, we couldn't process your transaction. Please try again later."
			);
		}
	}

	private async handleWithdrawCommand(
		chatId: number,
		session: UserSession,
		args: string[]
	) {
		if (!session.isAuthenticated) {
			await this.sendMessage(
				chatId,
				"You need to login first. Use /login to authenticate."
			);
			return;
		}

		if (args.length === 0) {
			session.awaitingInput = "withdraw_amount";
			await this.sendMessage(
				chatId,
				"Please enter the amount you want to withdraw in USDC:"
			);
		} else {
			session.transferData = {
				amount: Number.parseFloat(args[0]),
			};
			await this.promptForWithdrawalMethod(chatId, session);
		}
	}

	private async promptForWithdrawalMethod(
		chatId: number,
		session: UserSession
	) {
		await this.sendMessage(chatId, "Please select a withdrawal method:", {
			reply_markup: {
				inline_keyboard: [
					[{ text: "🏦 Bank Account", callback_data: "withdraw:bank" }],
					[{ text: "💼 External Wallet", callback_data: "withdraw:wallet" }],
				],
			},
		});
	}

	private async handleDepositCommand(chatId: number, session: UserSession) {
		if (!session.isAuthenticated) {
			await this.sendMessage(
				chatId,
				"You need to login first. Use /login to authenticate."
			);
			return;
		}

		try {
			const wallets = await this.api.getWallets(session.token);

			if (!wallets.length) {
				await this.sendMessage(chatId, "You don't have any wallets yet.");
				return;
			}

			const defaultWallet = wallets.find((w) => w.isDefault) || wallets[0];

			await this.sendMessage(
				chatId,
				`💰 *Deposit Instructions*\n\n` +
					`To deposit USDC to your Copperx account, send funds to this address:\n\n` +
					`\`${defaultWallet.address}\`\n\n` +
					`Network: ${defaultWallet.network}\n\n` +
					`⚠️ Make sure to only send USDC on the ${defaultWallet.network} network!`
			);
		} catch (error) {
			console.error("Error fetching wallet:", error);
			await this.sendMessage(
				chatId,
				"Sorry, I couldn't fetch your wallet information. Please try again later."
			);
		}
	}

	private async handleHistoryCommand(chatId: number, session: UserSession) {
		if (!session.isAuthenticated) {
			await this.sendMessage(
				chatId,
				"You need to login first. Use /login to authenticate."
			);
			return;
		}

		try {
			const transfers = await this.api.getTransfers(session.token, 1, 10);

			if (!transfers.length) {
				await this.sendMessage(
					chatId,
					"You don't have any transaction history yet."
				);
				return;
			}

			let message = "📜 *Recent Transactions*\n\n";

			transfers.forEach((transfer, index) => {
				message += `*${index + 1}. ${transfer.type.toUpperCase()}*\n`;
				message += `Amount: ${transfer.amount} USDC\n`;
				message += `Date: ${new Date(transfer.createdAt).toLocaleString()}\n`;
				message += `Status: ${transfer.status}\n\n`;
			});

			await this.sendMessage(chatId, message);
		} catch (error) {
			console.error("Error fetching transaction history:", error);
			await this.sendMessage(
				chatId,
				"Sorry, I couldn't fetch your transaction history. Please try again later."
			);
		}
	}

	private async handleHelpCommand(chatId: number) {
		await this.sendMessage(
			chatId,
			"🤖 *Copperx Bot Commands*\n\n" +
				"/start - Start the bot and login\n" +
				"/login - Login to your Copperx account\n" +
				"/balance - Check your wallet balances\n" +
				"/send [email] [amount] - Send USDC to an email\n" +
				"/withdraw [amount] - Withdraw USDC\n" +
				"/deposit - Get deposit instructions\n" +
				"/history - View transaction history\n" +
				"/help - Show this help message\n\n" +
				"Need more help? Visit our community: https://t.me/copperxcommunity/2183"
		);
	}

	private async handleUserInput(
		chatId: number,
		userId: number,
		text: string,
		session: UserSession
	) {
		switch (session.awaitingInput) {
			case "email":
				// Clean up the email input
				const cleanEmail = text.trim().toLowerCase();

				// Basic email validation
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(cleanEmail)) {
					await this.sendMessage(
						chatId,
						"🤔 That doesn't look like a valid email address. Please enter a valid email address:"
					);
					return;
				}

				session.authData = { email: cleanEmail };
				session.awaitingInput = "otp";

				try {
					// Request OTP and store the session ID (sid) from the response
					const result = await this.api.requestEmailOTP(cleanEmail);
					session.authData.sid = result.sid;

					await this.sendMessage(
						chatId,
						"📬 We've sent a one-time password to your email. Please enter it when you receive it:"
					);
				} catch (error) {
					console.error("Error requesting OTP:", error);
					await this.sendMessage(
						chatId,
						"❌ Sorry, we couldn't send the OTP to your email. Please check the email address and try again."
					);
					session.awaitingInput = "email";
				}
				break;

			case "otp":
				if (
					!session.authData ||
					!session.authData.email ||
					!session.authData.sid
				) {
					await this.sendMessage(
						chatId,
						"⚠️ Session expired. Please start again with /login"
					);
					session.reset();
					return;
				}

				// Clean up the OTP input
				const cleanOTP = text.trim().replace(/\s+/g, "");

				try {
					// Pass the sid to the authentication method
					const authResult = await this.api.authenticateWithOTP(
						session.authData.email,
						cleanOTP,
						session.authData.sid
					);

					session.token = authResult.token;
					session.isAuthenticated = true;
					session.awaitingInput = null;

					await this.sendMessage(
						chatId,
						"🎉 *Login Successful!*\n\n" +
							"You're now logged in to your Copperx account.\n\n" +
							"*Quick Commands:*\n" +
							"• /balance - Check your wallet balances\n" +
							"• /send - Send USDC to someone\n" +
							"• /withdraw - Withdraw USDC\n" +
							"• /deposit - Get deposit instructions\n\n" +
							"What would you like to do next?"
					);
				} catch (error) {
					console.error("Error authenticating:", error);
					await this.sendMessage(
						chatId,
						"❌ Invalid OTP. Please try again or use /login to restart the process."
					);
				}
				break;

			case "send_email":
				// Clean up and validate the email
				const recipientEmail = text.trim().toLowerCase();
				const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail);

				if (!isValidEmail) {
					await this.sendMessage(
						chatId,
						"🤔 That doesn't look like a valid email address. Please enter a valid recipient email:"
					);
					return;
				}

				session.transferData = { recipient: recipientEmail };
				session.awaitingInput = "send_amount";
				await this.sendMessage(
					chatId,
					`📧 Sending to: *${recipientEmail}*\n\nPlease enter the amount in USDC you want to send:`
				);
				break;

			case "send_amount":
				if (!session.transferData) {
					await this.sendMessage(
						chatId,
						"⚠️ Session expired. Please start again with /send"
					);
					session.reset();
					return;
				}

				// Clean up and parse the amount
				const cleanAmount = text.trim().replace(/[$,]/g, "");
				const amount = Number.parseFloat(cleanAmount);

				if (isNaN(amount) || amount <= 0) {
					await this.sendMessage(
						chatId,
						"❌ Please enter a valid amount greater than 0. For example: 10.5"
					);
					return;
				}

				session.transferData.amount = amount;
				session.awaitingInput = null;
				await this.confirmSendTransaction(chatId, session);
				break;

			case "withdraw_amount":
				// Clean up and parse the withdrawal amount
				const cleanWithdrawAmount = text.trim().replace(/[$,]/g, "");
				const withdrawAmount = Number.parseFloat(cleanWithdrawAmount);

				if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
					await this.sendMessage(
						chatId,
						"❌ Please enter a valid amount greater than 0. For example: 50.25"
					);
					return;
				}

				session.transferData = { amount: withdrawAmount };
				session.awaitingInput = null;
				await this.promptForWithdrawalMethod(chatId, session);
				break;

			default:
				// Try to understand natural language queries
				const lowerText = text.toLowerCase();

				if (
					lowerText.includes("balance") ||
					lowerText.includes("how much") ||
					lowerText.includes("check")
				) {
					if (session.isAuthenticated) {
						await this.handleBalanceCommand(chatId, session);
					} else {
						await this.sendMessage(
							chatId,
							"You need to login first to check your balance. Use /login to authenticate."
						);
					}
				} else if (
					lowerText.includes("help") ||
					lowerText.includes("commands") ||
					lowerText.includes("what can you do")
				) {
					await this.handleHelpCommand(chatId);
				} else {
					await this.sendMessage(
						chatId,
						"I don't understand that command. Please use /help to see all available commands."
					);
				}
		}
	}

	private async handleCancel(chatId: number, session: UserSession) {
		session.transferData = null;
		session.awaitingInput = null;

		await this.sendMessage(
			chatId,
			"Operation cancelled. What would you like to do next?"
		);
	}

	private async handleWalletSelection(
		chatId: number,
		session: UserSession,
		walletId: string
	) {
		if (!session.isAuthenticated) {
			await this.sendMessage(chatId, "You need to login first.");
			return;
		}

		try {
			await this.api.setDefaultWallet(session.token, walletId);
			await this.sendMessage(chatId, "Default wallet updated successfully.");
		} catch (error) {
			console.error("Error setting default wallet:", error);
			await this.sendMessage(
				chatId,
				"Sorry, I couldn't update your default wallet. Please try again later."
			);
		}
	}

	private async handleConfirmWithdraw(chatId: number, session: UserSession) {
		// Implementation for withdrawal confirmation
		await this.sendMessage(
			chatId,
			"Processing your withdrawal... This feature is coming soon."
		);
	}

	private getUserSession(userId: number): UserSession {
		if (!this.userSessions.has(userId)) {
			this.userSessions.set(userId, new UserSession());
		}
		return this.userSessions.get(userId)!;
	}

	private async sendMessage(chatId: number, text: string, options: any = {}) {
		const url = `https://api.telegram.org/bot${this.token}/sendMessage`;

		const payload = {
			chat_id: chatId,
			text,
			parse_mode: "Markdown",
			...options,
		};

		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Telegram API error:", errorData);
			}

			return await response.json();
		} catch (error) {
			console.error("Error sending message:", error);
		}
	}

	private async answerCallbackQuery(callbackQueryId: string, text?: string) {
		const url = `https://api.telegram.org/bot${this.token}/answerCallbackQuery`;

		const payload: any = {
			callback_query_id: callbackQueryId,
		};

		if (text) {
			payload.text = text;
		}

		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			return await response.json();
		} catch (error) {
			console.error("Error answering callback query:", error);
		}
	}

	private async confirmSendTransaction(chatId: number, session: UserSession) {
		if (
			!session.transferData ||
			!session.transferData.recipient ||
			!session.transferData.amount
		) {
			await this.sendMessage(
				chatId,
				"Missing transaction details. Please try again."
			);
			return;
		}

		await this.sendMessage(
			chatId,
			`📤 *Transaction Confirmation Required*\n\n` +
				`Please review the details carefully:\n\n` +
				`📧 *Recipient:* ${session.transferData.recipient}\n` +
				`💰 *Amount:* ${session.transferData.amount.toFixed(2)} USDC\n\n` +
				`Is everything correct?`,
			{
				reply_markup: {
					inline_keyboard: [
						[{ text: "✅ Yes, Send Payment", callback_data: "confirm_send" }],
						[{ text: "❌ No, Cancel Transaction", callback_data: "cancel" }],
					],
				},
			}
		);
	}

	private async handleConfirmSend(chatId: number, session: UserSession) {
		if (!session.transferData || !session.isAuthenticated) {
			await this.sendMessage(
				chatId,
				"⚠️ Transaction details missing or session expired."
			);
			return;
		}

		try {
			await this.sendMessage(chatId, "⏳ Processing your transaction...");

			const result = await this.api.sendFunds(
				session.token,
				session.transferData.recipient,
				session.transferData.amount
			);

			await this.sendMessage(
				chatId,
				`✅ *Transaction Successfully Completed*\n\n` +
					`You've sent ${session.transferData.amount.toFixed(2)} USDC to ${
						session.transferData.recipient
					}\n\n` +
					`🧾 *Transaction ID:* ${result.transferId}\n` +
					`📊 *Status:* ${result.status || "Completed"}\n\n` +
					`Use /balance to check your updated balance.`
			);

			// Reset transfer data
			session.transferData = null;
		} catch (error) {
			console.error("Error sending funds:", error);
			await this.sendMessage(
				chatId,
				"❌ *Transaction Failed*\n\n" +
					"Sorry, we couldn't process your transaction. This could be due to:\n" +
					"• Insufficient funds\n" +
					"• Network issues\n" +
					"• Invalid recipient\n\n" +
					"Please try again later or contact support."
			);
		}
	}

	private async handleStartCommand(chatId: number, userId: number) {
		const session = this.getUserSession(userId);
		session.reset();

		await this.sendMessage(
			chatId,
			"👋 *Welcome to Copperx Payout Bot!*\n\n" +
				"I can help you manage your Copperx account directly from Telegram. Here's what you can do:\n\n" +
				"• Send and receive USDC\n" +
				"• Check wallet balances\n" +
				"• Withdraw funds\n" +
				"• View transaction history\n\n" +
				"To get started, please login to your account:",
			{
				reply_markup: {
					inline_keyboard: [
						[{ text: "🔑 Login Now", callback_data: "login" }],
						[{ text: "❓ View Help", callback_data: "help" }],
						[
							{
								text: "🌐 Visit Community Support",
								url: "https://t.me/copperxcommunity/2183",
							},
						],
					],
				},
			}
		);
	}

	private async handleHelpCommand(chatId: number) {
		await this.sendMessage(
			chatId,
			"🤖 *Copperx Bot Commands & Help*\n\n" +
				"*Basic Commands:*\n" +
				"• /start - Start the bot and see main menu\n" +
				"• /login - Login to your Copperx account\n" +
				"• /help - Show this help message\n\n" +
				"*Account & Wallet Commands:*\n" +
				"• /balance - Check your wallet balances\n" +
				"• /deposit - Get deposit instructions\n" +
				"• /history - View transaction history\n\n" +
				"*Transaction Commands:*\n" +
				"• /send - Send USDC to an email\n" +
				"     Example: `/send user@example.com 10.5`\n" +
				"• /withdraw - Withdraw USDC\n" +
				"     Example: `/withdraw 25`\n\n" +
				"*Need Help?*\n" +
				"• 💬 Visit our community: https://t.me/copperxcommunity/2183\n" +
				"• You can also type questions naturally and I'll try to help!"
		);
	}
}

class UserSession {
	isAuthenticated = false;
	token: string | null = null;
	awaitingInput: string | null = null;
	authData: { email?: string; sid?: string } | null = null;
	transferData: {
		recipient?: string;
		amount?: number;
		method?: string;
	} | null = null;

	reset() {
		this.isAuthenticated = false;
		this.token = null;
		this.awaitingInput = null;
		this.authData = null;
		this.transferData = null;
	}
}
