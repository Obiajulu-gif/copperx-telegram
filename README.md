# Copperx Telegram Bot

A Telegram bot for managing Copperx stablecoin transactions directly through Telegram. This bot allows users to authenticate with their Copperx account, check balances, send funds, withdraw to external wallets, and receive real-time deposit notifications.

## Features

### Authentication & Account Management
- User login/authentication with Copperx credentials via email OTP
- View account profile and status
- Check KYC/KYB approval status

### Wallet Management
- View all wallet balances across networks
- Set default wallet for transactions
- Get deposit instructions
- View transaction history

### Fund Transfers
- Send funds to email addresses
- Send funds to external wallet addresses
- Withdraw funds to external wallets
- View last 10 transactions

### Deposit Notifications
- Receive real-time notifications when deposits are received
- Implemented using Pusher for real-time updates

## Prerequisites

- Node.js 18 or higher
- A Telegram Bot Token (obtained from [@BotFather](https://t.me/BotFather))
- Copperx API access

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/copperx-telegram-bot.git
cd copperx-telegram-bot
```

2. Install dependencies:


```shellscript
npm install
```

3. Create a `.env` file in the root directory based on `.env.example`:


```shellscript
cp .env.example .env
```

4. Edit the `.env` file and add your Telegram Bot Token:


```plaintext
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
NEXT_PUBLIC_PUSHER_KEY=e089376087cac1a62785
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
NEXT_PUBLIC_BASE_URL=https://your-deployment-url.com
```

5. Build the application:


```shellscript
npm run build
```

6. Start the server:


```shellscript
npm start
```

## Deployment

### Deploying to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command to `npm install && npm run build`
4. Set the start command to `npm start`
5. Add the environment variables (TELEGRAM_BOT_TOKEN, NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER, NEXT_PUBLIC_BASE_URL)
6. Deploy the service


### Deploying to Vercel

1. Import your GitHub repository to Vercel
2. Configure the environment variables
3. Deploy the project


## Setting up the Webhook

After deployment, you need to set up a webhook to connect your Telegram bot to your server:

1. Visit the setup page at `https://your-deployment-url.com/setup`
2. Enter your Telegram Bot Token
3. Click "Set Webhook" to configure the webhook


Alternatively, you can set up the webhook manually by visiting:

```plaintext
https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook?url=https://your-deployment-url.com/api/telegram/webhook
```

## Bot Commands

- `/start` - Start the bot and see main menu
- `/login` - Login to your Copperx account
- `/profile` - View your account profile
- `/kyc` - Check your KYC verification status
- `/balance` - Check your wallet balances
- `/wallets` - Manage your wallets
- `/send [email/address] [amount]` - Send USDC to an email or wallet
- `/withdraw [amount]` - Withdraw USDC
- `/deposit` - Get deposit instructions
- `/history` - View transaction history
- `/help` - Show help message
- `/logout` - Log out of your account


## API Integration Details

### Authentication

- Email OTP Request: `/api/auth/email-otp/request`
- Email OTP Authentication: `/api/auth/email-otp/authenticate`
- User Profile: `/api/auth/me`


### Wallet Management

- Get Wallets: `/api/wallets`
- Get Default Wallet: `/api/wallets/default`
- Set Default Wallet: `/api/wallets/default` (POST)
- Get Balances: `/api/wallets/balances`


### Transfers

- Send Funds: `/api/transfers/send`
- Withdraw to Wallet: `/api/transfers/wallet-withdraw`
- Withdraw to Bank: `/api/transfers/offramp`
- Get Transfers: `/api/transfers`


### Notifications

- Pusher Authentication: `/api/notifications/auth`
- Pusher Channel: `private-org-${organizationId}`
- Pusher Event: `deposit`


## Troubleshooting

### Bot Not Responding

1. Check if your server is running
2. Verify that the webhook is set up correctly
3. Check the server logs for any errors
4. Ensure your Telegram bot token is correct


### Authentication Issues

1. Make sure you're using a valid Copperx email
2. Check that the OTP is entered correctly
3. Verify that your Copperx account is active


### Transaction Failures

1. Check if you have sufficient funds
2. Verify that the recipient email or wallet address is correct
3. Ensure your KYC verification is complete for certain operations


### Webhook Setup Issues

1. Make sure your server is publicly accessible
2. Verify that the webhook URL is correct
3. Check that your server is properly handling the webhook requests


## Security Considerations

- The bot uses secure authentication via email OTP
- Session tokens are stored in memory and not persisted
- Sensitive operations require confirmation
- All API requests use HTTPS
- User sessions expire after inactivity


## Support

For support, please join the Copperx community on Telegram: [https://t.me/copperxcommunity/2183](https://t.me/copperxcommunity/2183)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Copperx](https://copperx.io) for providing the API
- [Telegram Bot API](https://core.telegram.org/bots/api) for the bot platform
- [Pusher](https://pusher.com) for real-time notifications
- [Next.js](https://nextjs.org) for the web framework


