import { json } from "@sveltejs/kit";
import { Resend } from "resend";
import { b as private_env } from "../../../../../chunks/shared-server.js";
import { p as prisma } from "../../../../../chunks/db.js";
let resend = null;
if (private_env.RESEND_API_KEY) {
  resend = new Resend(private_env.RESEND_API_KEY);
}
async function subscribeToNewsletter(subscriber) {
  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: subscriber.email }
    });
    if (existing && !existing.unsubscribedAt) {
      return { success: false, message: "Already subscribed" };
    }
    if (existing && existing.unsubscribedAt) {
      await prisma.newsletterSubscriber.update({
        where: { email: subscriber.email },
        data: {
          name: subscriber.name,
          source: subscriber.source,
          conversationId: subscriber.conversationId,
          metadata: subscriber.metadata,
          unsubscribedAt: null
        }
      });
    } else {
      await prisma.newsletterSubscriber.create({
        data: {
          email: subscriber.email,
          name: subscriber.name,
          source: subscriber.source || "conversation",
          conversationId: subscriber.conversationId,
          metadata: subscriber.metadata
        }
      });
    }
    if (resend && private_env.RESEND_FROM_EMAIL) {
      try {
        await resend.emails.send({
          from: private_env.RESEND_FROM_EMAIL,
          to: subscriber.email,
          subject: "Welcome to Flo's Newsletter!",
          html: `
						<h1>Welcome!</h1>
						<p>Thanks for subscribing to Flo's newsletter. You'll receive updates about projects, insights, and more.</p>
						<p>If you didn't subscribe, you can <a href="${private_env.PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}">unsubscribe here</a>.</p>
					`
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
    }
    return { success: true, message: "Successfully subscribed!" };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to subscribe"
    };
  }
}
const POST = async ({ request }) => {
  try {
    const { email, name, conversationId, metadata } = await request.json();
    if (!email || !email.includes("@")) {
      return json({ error: "Valid email is required" }, { status: 400 });
    }
    const result = await subscribeToNewsletter({
      email,
      name,
      source: "conversation",
      conversationId,
      metadata
    });
    if (!result.success) {
      return json({ error: result.message }, { status: 400 });
    }
    return json({ success: true, message: result.message });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return json(
      { error: "Failed to subscribe", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
};
export {
  POST
};
