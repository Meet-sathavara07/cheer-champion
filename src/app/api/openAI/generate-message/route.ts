import { jsonResponse } from "@/helpers/loginHelper";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { openai } from "@/app/lib/openai";

export async function POST(req: NextRequest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
  try {
    const { prompt } = await req.json();
    const completion = await openai.chat.completions.create(
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    if (!completion?.choices[0]?.message?.content) {
      return jsonResponse(400, "Something Went Wrong!");
    }
    return jsonResponse(200, "Generate message by AI successfully", {
      message: completion.choices[0].message.content,
    });
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.message === "Request was aborted.") {
      return jsonResponse(408, "Request timed out. Please try again.");
    }
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    return jsonResponse(
      status,
      error?.response?.data.message || "Something went wrong"
    );
  }
}
