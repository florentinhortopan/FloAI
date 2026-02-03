import OpenAI from "openai";
import { b as private_env } from "./shared-server.js";
import { p as prisma } from "./db.js";
if (!private_env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}
const openai = new OpenAI({
  apiKey: private_env.OPENAI_API_KEY
});
async function analyzeJobMatch(context) {
  const systemPrompt = `You are Flo's AI assistant, helping analyze job matches. You're professional, insightful, and personable.
	
Your task is to analyze how well Flo's profile matches a given job description and provide:
1. A matching rate (0-100%)
2. Detailed analysis
3. Key strengths
4. Potential gaps
5. Actionable recommendations

Be specific and reference actual skills and experiences from the profile.`;
  const userPrompt = `Analyze this job match:

PROFILE:
Skills: ${context.profile.skills.join(", ")}
Experience: ${JSON.stringify(context.profile.experience, null, 2)}
${context.profile.resumeText ? `Resume: ${context.profile.resumeText.substring(0, 2e3)}` : ""}

JOB DESCRIPTION:
${context.jobDescription.substring(0, 4e3)}

INTENT: ${context.intent}

Provide a JSON response with:
{
  "matchingRate": number (0-100),
  "analysis": "detailed text analysis",
  "strengths": ["strength1", "strength2", ...],
  "gaps": ["gap1", "gap2", ...],
  "recommendations": ["rec1", "rec2", ...]
}`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }
  });
  const response = JSON.parse(completion.choices[0].message.content || "{}");
  return {
    matchingRate: response.matchingRate || 0,
    analysis: response.analysis || "",
    strengths: response.strengths || [],
    gaps: response.gaps || [],
    recommendations: response.recommendations || []
  };
}
async function generateConversationResponse(messages, intent, context) {
  const lastUserMessage = messages.filter((m) => m.role === "user").pop()?.content || "";
  const relevantKnowledge = await retrieveRelevantKnowledge(lastUserMessage, 3);
  const knowledgeContext = relevantKnowledge.length > 0 ? `

RELEVANT KNOWLEDGE BASE:
${relevantKnowledge.map((kb) => `- ${kb.title}: ${kb.content.substring(0, 500)}`).join("\n\n")}` : "";
  const systemPrompt = `You are Flo's AI assistant. You're helping with: ${intent}.

${intent === "hire" ? "Help potential employers understand Flo's value and match with job opportunities." : ""}
${intent === "partner" ? "Help potential partners explore collaboration opportunities." : ""}
${intent === "fun" ? "Be engaging, witty, and have fun conversations." : ""}
${intent === "newsletter" ? "Help users subscribe and learn about Flo's updates." : ""}

Use the knowledge base information provided to guide your responses. Be conversational, natural, and helpful. If job matching context is provided, reference it naturally.${knowledgeContext}`;
  const contextMessages = context && context.matchingRate !== void 0 ? [
    {
      role: "system",
      content: `Context: Job match analysis shows ${context.matchingRate}% match. ${context.analysis || ""}`
    }
  ] : [];
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: systemPrompt },
      ...contextMessages,
      ...messages
    ],
    temperature: 0.8
  });
  return completion.choices[0].message.content || "";
}
async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.substring(0, 8e3)
    // Limit to avoid token limits
  });
  return response.data[0].embedding;
}
function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
async function storeKnowledgeDocument(title, content, category, metadata) {
  const embedding = await generateEmbedding(content);
  const doc = await prisma.knowledgeBase.create({
    data: {
      title,
      content,
      category,
      embedding,
      metadata
    }
  });
  return {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    category: doc.category || void 0
  };
}
async function retrieveRelevantKnowledge(query, limit = 5, category) {
  const queryEmbedding = await generateEmbedding(query);
  const allDocs = await prisma.knowledgeBase.findMany({
    where: void 0
  });
  const scoredDocs = allDocs.map((doc) => {
    if (!doc.embedding) return null;
    const similarity = cosineSimilarity(
      queryEmbedding,
      doc.embedding
    );
    return {
      doc,
      similarity
    };
  }).filter((item) => item !== null).sort((a, b) => b.similarity - a.similarity).slice(0, limit);
  return scoredDocs.map(({ doc }) => ({
    id: doc.id,
    title: doc.title,
    content: doc.content,
    category: doc.category || void 0
  }));
}
async function getAllKnowledgeDocuments() {
  const docs = await prisma.knowledgeBase.findMany({
    orderBy: { createdAt: "desc" }
  });
  return docs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    content: doc.content,
    category: doc.category || void 0
  }));
}
async function deleteKnowledgeDocument(id) {
  await prisma.knowledgeBase.delete({
    where: { id }
  });
}
async function updateKnowledgeDocument(id, title, content, category) {
  const existing = await prisma.knowledgeBase.findUnique({
    where: { id }
  });
  if (!existing) {
    throw new Error("Document not found");
  }
  const finalContent = content || existing.content;
  const embedding = await generateEmbedding(finalContent);
  const updated = await prisma.knowledgeBase.update({
    where: { id },
    data: {
      title: title || existing.title,
      content: finalContent,
      category: category !== void 0 ? category : existing.category,
      embedding
    }
  });
  return {
    id: updated.id,
    title: updated.title,
    content: updated.content,
    category: updated.category || void 0
  };
}
export {
  analyzeJobMatch as a,
  generateConversationResponse as b,
  deleteKnowledgeDocument as d,
  getAllKnowledgeDocuments as g,
  storeKnowledgeDocument as s,
  updateKnowledgeDocument as u
};
