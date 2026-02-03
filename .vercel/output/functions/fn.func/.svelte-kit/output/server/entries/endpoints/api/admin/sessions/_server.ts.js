import { json } from "@sveltejs/kit";
import { p as prisma } from "../../../../../chunks/db.js";
const GET = async ({ url }) => {
  try {
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const intent = url.searchParams.get("intent") || void 0;
    const skip = (page - 1) * limit;
    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: intent ? { intent } : void 0,
        include: {
          messages: {
            orderBy: { createdAt: "asc" }
          },
          profile: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.conversation.count({
        where: intent ? { intent } : void 0
      })
    ]);
    const sessions = conversations.map((conv) => {
      const messages = conv.messages;
      const firstMessage = messages[0];
      const lastMessage = messages[messages.length - 1];
      const duration = lastMessage && firstMessage ? Math.floor((lastMessage.createdAt.getTime() - firstMessage.createdAt.getTime()) / 1e3) : 0;
      const jobMatch = messages.find((m) => m.metadata && m.metadata.matchingRate !== void 0);
      const jobMatchRate = jobMatch ? jobMatch.metadata.matchingRate : null;
      return {
        id: conv.id,
        sessionId: conv.sessionId,
        intent: conv.intent,
        messageCount: messages.length,
        duration,
        jobMatchRate,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content.substring(0, 100) + (m.content.length > 100 ? "..." : ""),
          createdAt: m.createdAt
        }))
      };
    });
    return json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
};
export {
  GET
};
