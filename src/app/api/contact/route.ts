import { NextResponse } from "next/server";
import { z } from "zod";
import { CONTACT } from "@/lib/site-content";
import { apiError, handleRouteError, validationError } from "@/lib/api-errors";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  message: z.string().trim().min(10).max(5000),
  formType: z.enum(["grievance", "general"]),
});

/** Public contact / grievance forms — delivered to the district DRR inbox. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { name, email, message, formType } = parsed.data;
    const subject =
      formType === "grievance"
        ? `Grievance Redressal — ${name}`
        : `Contact form — ${name}`;

    const res = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(CONTACT.drrEmail)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: subject,
          _template: "table",
          _captcha: "false",
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return apiError("Could not send your message. Please try again later.", 502, text);
    }

    const data = (await res.json().catch(() => null)) as { success?: string } | null;
    if (data?.success !== "true") {
      return apiError("Could not send your message. Please try again later.", 502);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "Could not send your message.");
  }
}
