import { sendDomainReminders } from "@/src/lib/email/domain-reminders";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Verify the request is authorized (using a secret token)
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (
      !process.env.CRON_SECRET_DOMAIN_NAME_MODULE ||
      token !== process.env.CRON_SECRET_DOMAIN_NAME_MODULE
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await sendDomainReminders();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending domain reminders:", error);
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}
