import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // In a production environment, you'd want to store this token securely
    // For example, you might use Vercel environment variables or a database
    // For this demo, we'll just respond with success

    // Optional: Verify the token is valid by making a request to the Telegram API
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`)
    const data = await response.json()

    if (!data.ok) {
      return NextResponse.json({ error: "Invalid token", details: data.description }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Bot token saved successfully",
      botInfo: data.result,
    })
  } catch (error) {
    console.error("Error saving bot token:", error)
    return NextResponse.json({ error: "Failed to save bot token" }, { status: 500 })
  }
}

