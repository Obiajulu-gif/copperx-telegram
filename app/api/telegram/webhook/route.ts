import { type NextRequest, NextResponse } from "next/server"
import { TelegramBot } from "@/lib/telegram-bot"

// Initialize the bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || "")

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()

    // Process the incoming update
    await bot.handleUpdate(update)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error handling Telegram webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: "Telegram webhook is active" })
}

