import { json } from "@sveltejs/kit";
import { a as analyzeJobMatch, b as generateConversationResponse } from "../../../../chunks/rag.js";
import { p as prisma } from "../../../../chunks/db.js";
import { b as private_env } from "../../../../chunks/shared-server.js";
import { p as parseJobDescription } from "../../../../chunks/jobParser.js";
function getVoiceConfig() {
  if (!private_env.ELEVENLABS_API_KEY || !private_env.ELEVENLABS_VOICE_ID) {
    return null;
  }
  return {
    apiKey: private_env.ELEVENLABS_API_KEY,
    voiceId: private_env.ELEVENLABS_VOICE_ID
  };
}
async function synthesizeSpeech(text, config) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}`,
    {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": config.apiKey
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    }
  );
  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`);
  }
  return await response.arrayBuffer();
}
const POST = async ({ request }) => {
  try {
    const { sessionId, intent, message, conversationHistory } = await request.json();
    let profile = await prisma.profile.findFirst();
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          name: "Flo",
          email: "flo@example.com",
          skills: ["AI/ML", "Full Stack Development", "Product Management"],
          resumeText: "Experienced developer and AI enthusiast...",
          experience: {
            years: 5,
            roles: ["Senior Developer", "AI Engineer"]
          }
        }
      });
    }
    let conversation = await prisma.conversation.findUnique({
      where: { sessionId }
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          sessionId,
          profileId: profile.id,
          intent
        }
      });
    }
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message
      }
    });
    const isURL = message.startsWith("http://") || message.startsWith("https://");
    const isJobDescription = isURL || message.toLowerCase().includes("job") || message.toLowerCase().includes("position") || message.toLowerCase().includes("role") || message.toLowerCase().includes("requirements") || message.length > 500;
    let jobDescriptionText = message;
    let jobMatchContext = null;
    let response = "";
    if (intent === "hire" && isJobDescription) {
      try {
        if (isURL) {
          const parsed = await parseJobDescription(message, "url");
          jobDescriptionText = parsed.description;
          await prisma.jobDescription.create({
            data: {
              url: message,
              title: parsed.title,
              company: parsed.company,
              description: parsed.description,
              rawContent: parsed.rawContent,
              format: "url"
            }
          });
        }
      } catch (error) {
        console.error("Error parsing job description:", error);
      }
      const matchResult = await analyzeJobMatch({
        profile: {
          skills: profile.skills,
          experience: profile.experience,
          resumeText: profile.resumeText || void 0
        },
        jobDescription: jobDescriptionText,
        intent
      });
      jobMatchContext = matchResult;
      const conversationContext = {
        matchingRate: matchResult.matchingRate,
        analysis: matchResult.analysis,
        strengths: matchResult.strengths,
        gaps: matchResult.gaps,
        recommendations: matchResult.recommendations
      };
      response = await generateConversationResponse(
        conversationHistory.map((m) => ({
          role: m.role,
          content: m.content
        })),
        intent,
        conversationContext
      );
    } else {
      response = await generateConversationResponse(
        conversationHistory.map((m) => ({
          role: m.role,
          content: m.content
        })),
        intent
      );
    }
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: response,
        metadata: jobMatchContext
      }
    });
    let audioUrl = null;
    const voiceConfig = getVoiceConfig();
    if (voiceConfig) {
      try {
        const audioBuffer = await synthesizeSpeech(response, voiceConfig);
        const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
        audioUrl = URL.createObjectURL(blob);
      } catch (error) {
        console.error("Error synthesizing speech:", error);
      }
    }
    return json({
      response,
      metadata: jobMatchContext,
      audioUrl
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return json(
      { error: "Failed to process message", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
};
export {
  POST
};
