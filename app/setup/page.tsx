"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, Bot, CheckCircle, Copy } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function SetupPage() {
  const [botToken, setBotToken] = useState("")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Function to handle webhook setting
  const handleSetWebhook = async () => {
    if (!botToken) {
      toast({
        title: "Missing token",
        description: "Please enter your Telegram Bot Token",
        variant: "destructive",
      })
      return
    }

    // Build the webhook URL based on the current domain
    const domain = window.location.origin
    const webhookEndpoint = `${domain}/api/telegram/webhook`
    setWebhookUrl(webhookEndpoint)

    setIsLoading(true)
    setStatus("idle")

    try {
      // Call the Telegram API to set the webhook
      const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookEndpoint}`)
      const data = await response.json()

      if (data.ok) {
        setStatus("success")
        toast({
          title: "Webhook set successfully",
          description: "Your bot is now connected to this application",
        })

        // Store the token in localStorage for development purposes
        localStorage.setItem("TELEGRAM_BOT_TOKEN", botToken)

        // Optional: You could make an API call here to store the token on your server
        try {
          await fetch("/api/telegram/setup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: botToken }),
          })
        } catch (error) {
          console.error("Failed to save token:", error)
          // Non-critical error, we won't show this to the user
        }
      } else {
        setStatus("error")
        setErrorMessage(data.description || "Failed to set webhook")
        toast({
          title: "Webhook setup failed",
          description: data.description || "Failed to set webhook",
          variant: "destructive",
        })
      }
    } catch (error) {
      setStatus("error")
      setErrorMessage("Network error. Please try again.")
      toast({
        title: "Network error",
        description: "Failed to connect to Telegram API",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to copy webhook URL to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "You can now paste this URL",
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Bot Setup</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure your Copperx Telegram Bot</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bot Configuration</CardTitle>
            <CardDescription>Enter your Telegram Bot token and configure webhook</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bot-token">Telegram Bot Token</Label>
              <Input
                id="bot-token"
                type="password"
                placeholder="Enter your bot token"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Get this from{" "}
                <Link
                  href="https://t.me/BotFather"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @BotFather
                </Link>{" "}
                on Telegram
              </p>
            </div>

            {webhookUrl && (
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <div className="flex gap-2">
                  <Input id="webhook-url" value={webhookUrl} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(webhookUrl)}
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">This is the URL Telegram will send updates to</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex items-start p-3 text-sm bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md text-green-800 dark:text-green-300">
                <CheckCircle className="h-5 w-5 flex-shrink-0 mr-2 mt-0.5" />
                <p>Webhook set successfully! Your bot is now connected and ready to use.</p>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-start p-3 text-sm bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-300">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mr-2 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" onClick={handleSetWebhook} disabled={isLoading}>
              {isLoading ? "Setting Webhook..." : "Set Webhook"}
            </Button>
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

