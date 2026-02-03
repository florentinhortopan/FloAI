import { json } from "@sveltejs/kit";
import { p as prisma } from "../../../../../chunks/db.js";
const GET = async ({ url }) => {
  try {
    const format = url.searchParams.get("format") || "json";
    const sessionId = url.searchParams.get("sessionId") || void 0;
    if (sessionId) {
      const conversation = await prisma.conversation.findUnique({
        where: { sessionId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" }
          },
          profile: true
        }
      });
      if (!conversation) {
        return json({ error: "Conversation not found" }, { status: 404 });
      }
      if (format === "csv") {
        const csv = [
          "Role,Content,Created At",
          ...conversation.messages.map(
            (m) => `"${m.role}","${m.content.replace(/"/g, '""')}","${m.createdAt.toISOString()}"`
          )
        ].join("\n");
        return new Response(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="conversation-${sessionId}.csv"`
          }
        });
      }
      return json({
        sessionId: conversation.sessionId,
        intent: conversation.intent,
        createdAt: conversation.createdAt,
        messages: conversation.messages.map((m) => ({
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
          metadata: m.metadata
        }))
      });
    }
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        },
        profile: true
      },
      orderBy: { createdAt: "desc" }
    });
    if (format === "csv") {
      const csv = [
        "Session ID,Intent,Created At,Message Count,First Message,Last Message",
        ...conversations.map((conv) => {
          const firstMsg = conv.messages[0];
          const lastMsg = conv.messages[conv.messages.length - 1];
          return `"${conv.sessionId}","${conv.intent}","${conv.createdAt.toISOString()}","${conv.messages.length}","${firstMsg?.content.substring(0, 50).replace(/"/g, '""') || ""}","${lastMsg?.content.substring(0, 50).replace(/"/g, '""') || ""}"`;
        })
      ].join("\n");
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="all-conversations.csv"'
        }
      });
    }
    return json({
      conversations: conversations.map((conv) => ({
        sessionId: conv.sessionId,
        intent: conv.intent,
        createdAt: conv.createdAt,
        messageCount: conv.messages.length,
        messages: conv.messages.map((m) => ({
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
          metadata: m.metadata
        }))
      }))
    });
  } catch (error) {
    console.error("Export error:", error);
    return json({ error: "Failed to export conversations" }, { status: 500 });
  }
};
export {
  GET
};
