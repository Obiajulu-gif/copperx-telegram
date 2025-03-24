interface AuthResponse {
	token: string;
	user: {
		id: string;
		email: string;
		firstName?: string;
		lastName?: string;
		role?: string;
	};
}

interface Wallet {
	id: string;
	name: string;
	address: string;
	network: string;
	isDefault: boolean;
}

interface Balance {
	walletId: string;
	balance: string;
	currency: string;
}

interface Transfer {
	id: string;
	type: string;
	amount: string;
	status: string;
	createdAt: string;
}

interface TransferResult {
	transferId: string;
	status: string;
}

interface KycStatus {
	id: string;
	status: string;
	type: string;
}

export class CopperxAPI {
	private baseUrl = "https://income-api.copperx.io/api";

	async requestEmailOTP(
		email: string
	): Promise<{ email: string; sid: string }> {
		const response = await fetch(`${this.baseUrl}/auth/email-otp/request`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email }),
		});

		if (!response.ok) {
			throw new Error(`Failed to request OTP: ${response.statusText}`);
		}

		return await response.json();
	}

	async authenticateWithOTP(
		email: string,
		otp: string,
		sid: string
	): Promise<AuthResponse> {
		const response = await fetch(
			`${this.baseUrl}/auth/email-otp/authenticate`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, otp, sid }),
			}
		);

		if (!response.ok) {
			throw new Error(`Authentication failed: ${response.statusText}`);
		}

		const data = await response.json();

		// Map the response to our AuthResponse interface
		return {
			token: data.accessToken,
			user: {
				id: data.user.id,
				email: data.user.email,
				firstName: data.user.firstName,
				lastName: data.user.lastName,
				role: data.user.role,
			},
		};
	}

	async getUserProfile(token: string): Promise<any> {
		const response = await fetch(`${this.baseUrl}/auth/me`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch user profile: ${response.statusText}`);
		}

		return await response.json();
	}

	async getKycStatus(token: string): Promise<KycStatus[]> {
		const response = await fetch(`${this.baseUrl}/kycs`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch KYC status: ${response.statusText}`);
		}

		return await response.json();
	}

	async getWallets(token: string): Promise<Wallet[]> {
		const response = await fetch(`${this.baseUrl}/wallets`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch wallets: ${response.statusText}`);
		}

		return await response.json();
	}

	async getDefaultWallet(token: string): Promise<Wallet> {
		const response = await fetch(`${this.baseUrl}/wallets/default`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch default wallet: ${response.statusText}`);
		}

		return await response.json();
	}

	async setDefaultWallet(token: string, walletId: string): Promise<Wallet> {
		const response = await fetch(`${this.baseUrl}/wallets/default`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ walletId }),
		});

		if (!response.ok) {
			throw new Error(`Failed to set default wallet: ${response.statusText}`);
		}

		return await response.json();
	}

	async getBalances(token: string): Promise<Balance[]> {
		const response = await fetch(`${this.baseUrl}/wallets/balances`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch balances: ${response.statusText}`);
		}

		return await response.json();
	}

	async getTransfers(token: string, page = 1, limit = 10): Promise<Transfer[]> {
		const response = await fetch(
			`${this.baseUrl}/transfers?page=${page}&limit=${limit}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch transfers: ${response.statusText}`);
		}

		return await response.json();
	}

	async sendFunds(
		token: string,
		recipient: string,
		amount: number
	): Promise<TransferResult> {
		// Determine if recipient is an email or wallet address
		const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient);

		const payload: any = {
			amount: amount.toString(),
			currency: "USDC",
			purposeCode: "self",
		};

		// Set either email or walletAddress based on the recipient format
		if (isEmail) {
			payload.email = recipient;
		} else {
			payload.walletAddress = recipient;
		}

		const response = await fetch(`${this.baseUrl}/transfers/send`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			throw new Error(`Failed to send funds: ${response.statusText}`);
		}

		const data = await response.json();

		return {
			transferId: data.id,
			status: data.status,
		};
	}

	async sendBatchFunds(
		token: string,
		transfers: { recipient: string; amount: string }[]
	): Promise<TransferResult> {
		const response = await fetch(`${this.baseUrl}/transfers/send-batch`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				transfers,
				currency: "USDC",
			}),
		});

		if (!response.ok) {
			throw new Error(`Failed to send batch funds: ${response.statusText}`);
		}

		return await response.json();
	}

	async withdrawToWallet(
		token: string,
		walletAddress: string,
		amount: number
	): Promise<TransferResult> {
		const response = await fetch(`${this.baseUrl}/transfers/wallet-withdraw`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				walletAddress,
				amount: amount.toString(),
				currency: "USDC",
				purposeCode: "self",
			}),
		});

		if (!response.ok) {
			throw new Error(`Failed to withdraw to wallet: ${response.statusText}`);
		}

		const data = await response.json();

		return {
			transferId: data.id,
			status: data.status,
		};
	}

	async withdrawToBank(
		token: string,
		amount: number,
		bankDetails: any
	): Promise<TransferResult> {
		const response = await fetch(`${this.baseUrl}/transfers/offramp`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				amount: amount.toString(),
				currency: "USDC",
				bankDetails,
			}),
		});

		if (!response.ok) {
			throw new Error(`Failed to withdraw to bank: ${response.statusText}`);
		}

		return await response.json();
	}

	async authenticatePusher(
		token: string,
		socketId: string,
		channelName: string
	): Promise<any> {
		const response = await fetch(`${this.baseUrl}/notifications/auth`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				socket_id: socketId,
				channel_name: channelName,
			}),
		});

		if (!response.ok) {
			throw new Error(`Failed to authenticate Pusher: ${response.statusText}`);
		}

		return await response.json();
	}
}
