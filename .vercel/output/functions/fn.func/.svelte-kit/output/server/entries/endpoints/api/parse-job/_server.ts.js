import { json } from "@sveltejs/kit";
import { p as parseJobDescription } from "../../../../chunks/jobParser.js";
import { p as prisma } from "../../../../chunks/db.js";
const POST = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const url = formData.get("url");
    const text = formData.get("text");
    let parsed;
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const format = file.name.endsWith(".pdf") ? "pdf" : file.name.endsWith(".docx") ? "docx" : "txt";
      parsed = await parseJobDescription(buffer, format);
    } else if (url) {
      parsed = await parseJobDescription(url, "url");
    } else if (text) {
      parsed = await parseJobDescription(text, "text");
    } else {
      return json({ error: "No file, URL, or text provided" }, { status: 400 });
    }
    const jobDesc = await prisma.jobDescription.create({
      data: {
        url: parsed.format === "url" ? url || void 0 : void 0,
        title: parsed.title,
        company: parsed.company,
        description: parsed.description,
        rawContent: parsed.rawContent,
        format: parsed.format
      }
    });
    return json({
      success: true,
      jobDescription: {
        id: jobDesc.id,
        title: jobDesc.title,
        company: jobDesc.company,
        description: jobDesc.description,
        format: jobDesc.format
      }
    });
  } catch (error) {
    console.error("Job parsing error:", error);
    return json(
      {
        error: "Failed to parse job description",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
};
export {
  POST
};
