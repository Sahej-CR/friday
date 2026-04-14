import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface WebhookResponse {
  answer: string;
}

export async function POST(request: NextRequest) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Webhook URL not configured." },
      { status: 500 }
    );
  }

  let query: string;

  try {
    const body = await request.json();
    query = body.query;
    if (!query || typeof query !== "string" || query.trim() === "") {
      return NextResponse.json(
        { error: "query field is required." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query.trim() }),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Upstream webhook returned an error." },
        { status: 502 }
      );
    }

    const data = (await upstream.json()) as WebhookResponse;

    if (!data.answer) {
      return NextResponse.json(
        { error: "Unexpected response from assistant." },
        { status: 502 }
      );
    }

    return NextResponse.json({ answer: data.answer });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach the assistant." },
      { status: 503 }
    );
  }
}
