import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, Bot, Coins, Shield } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
      <div className="container max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Copperx Telegram Bot</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-8">
            Manage your Copperx stablecoin transactions directly through Telegram
          </p>

          {/* Ready to get started section moved to the top */}
          <div className="text-center mb-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start managing your Copperx account directly from Telegram
            </p>
            <Link href="https://t.me/CopperxPayoutBot" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2">
                <Bot className="w-5 h-5" />
                Open Telegram Bot
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon={<Shield className="w-6 h-6 text-primary" />}
            title="Secure Authentication"
            description="Login securely with your Copperx credentials and manage your account"
          />
          <FeatureCard
            icon={<Coins className="w-6 h-6 text-primary" />}
            title="Wallet Management"
            description="View balances, deposit funds, and check transaction history"
          />
          <FeatureCard
            icon={<ArrowUpRight className="w-6 h-6 text-primary" />}
            title="Easy Transfers"
            description="Send funds to emails, wallets, or withdraw to bank accounts"
          />
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Follow these steps to start using the Copperx Telegram Bot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                1
              </div>
              <div>
                <h3 className="font-medium">Find the bot on Telegram</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Search for @CopperxPayoutBot on Telegram</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                2
              </div>
              <div>
                <h3 className="font-medium">Start the bot</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Send /start to begin and follow the authentication process
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                3
              </div>
              <div>
                <h3 className="font-medium">Manage your funds</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use commands like /balance, /send, and /withdraw to manage your funds
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="https://t.me/copperxcommunity/2183" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full">
                Join Copperx Community
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </CardContent>
    </Card>
  )
}

