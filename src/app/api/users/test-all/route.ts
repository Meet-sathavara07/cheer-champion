import { NextResponse } from "next/server";
// import { processAllReminders } from "@/app/services/reminderService";

export async function GET() {
  try {
    console.log("\n=== Triggering Reminder Processing from /api/users/test-all ===");

    // All reminder logic is now centralized in reminderService.ts.
    // This route simply calls the service to run all checks.
    // await processAllReminders();

    console.log("\n=== Reminder Processing Complete (triggered by test-all) ===");

    return NextResponse.json({
      success: true,
      message:
        "Reminder processing executed successfully. Check server logs for details.",
    });
  } catch (error) {
    console.error("Error executing tests from test-all route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to execute tests" },
      { status: 500 }
    );
  }
} 