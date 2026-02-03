import { json } from "@sveltejs/kit";
import { p as prisma } from "../../../../../chunks/db.js";
const GET = async () => {
  try {
    const [
      totalConversations,
      totalMessages,
      conversationsByIntent,
      newsletterSubscribers,
      avgJobMatchRate,
      recentActivity
    ] = await Promise.all([
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.conversation.groupBy({
        by: ["intent"],
        _count: true
      }),
      prisma.newsletterSubscriber.count({
        where: { unsubscribedAt: null }
      }),
      prisma.message.aggregate({
        where: {
          metadata: {
            path: ["matchingRate"],
            not: null
          }
        },
        _avg: {
          // We'll calculate this manually since Prisma doesn't support JSON field aggregation easily
        }
      }),
      prisma.conversation.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: "asc" }
          }
        }
      })
    ]);
    const jobMatchMessages = await prisma.message.findMany({
      where: {
        metadata: {
          path: ["matchingRate"],
          not: null
        }
      },
      select: {
        metadata: true
      }
    });
    const matchRates = jobMatchMessages.map((m) => m.metadata?.matchingRate).filter((rate) => typeof rate === "number");
    const avgMatchRate = matchRates.length > 0 ? matchRates.reduce((a, b) => a + b, 0) / matchRates.length : null;
    return json({
      overview: {
        totalConversations,
        totalMessages,
        newsletterSubscribers,
        avgJobMatchRate: avgMatchRate
      },
      byIntent: conversationsByIntent.reduce(
        (acc, item) => {
          acc[item.intent] = item._count;
          return acc;
        },
        {}
      ),
      recentActivity: recentActivity.map((conv) => ({
        sessionId: conv.sessionId,
        intent: conv.intent,
        createdAt: conv.createdAt,
        firstMessage: conv.messages[0]?.content.substring(0, 100)
      }))
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
};
export {
  GET
};
