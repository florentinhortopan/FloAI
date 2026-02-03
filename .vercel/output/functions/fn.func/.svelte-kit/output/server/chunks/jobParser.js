import pdfParse from "pdf-parse";
import * as cheerio from "cheerio";
import mammoth from "mammoth";
async function parsePDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    const text = data.text;
    const lines = text.split("\n").filter((l) => l.trim());
    const title = lines[0] || "Untitled Position";
    const company = lines[1]?.includes("@") || lines[1]?.includes("www.") ? void 0 : lines[1];
    return {
      title: title.substring(0, 200),
      company: company?.substring(0, 100),
      description: text,
      rawContent: text,
      format: "pdf"
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
async function parseDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    const lines = text.split("\n").filter((l) => l.trim());
    const title = lines[0] || "Untitled Position";
    const company = lines[1]?.includes("@") || lines[1]?.includes("www.") ? void 0 : lines[1];
    return {
      title: title.substring(0, 200),
      company: company?.substring(0, 100),
      description: text,
      rawContent: text,
      format: "docx"
    };
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
async function parseJobURL(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    let title = $("h1.top-card-layout__title").text().trim() || $("h1.job-details-jobs-unified-top-card__job-title").text().trim() || $('h1[data-test-id="job-title"]').text().trim();
    let company = $("a.topcard__org-name-link").text().trim() || $("a.job-details-jobs-unified-top-card__company-name").text().trim() || $('[data-test-id="job-company"]').text().trim();
    let description = $(".show-more-less-html__markup").text().trim() || $(".description__text").text().trim() || $('[data-test-id="job-description"]').text().trim() || $(".jobs-description-content__text").text().trim();
    if (!description) {
      title = title || $("h1.jobsearch-JobInfoHeader-title").text().trim();
      company = company || $('[data-testid="inlineHeader-companyName"]').text().trim();
      description = description || $("#jobDescriptionText").text().trim();
    }
    if (!title) {
      title = $('meta[property="og:title"]').attr("content") || $("title").text().trim() || "Job Position";
    }
    if (!description) {
      description = $("main").text().trim() || $("article").text().trim() || $(".job-description").text().trim() || $("body").text().trim().substring(0, 5e3);
    }
    return {
      title: title.substring(0, 200) || "Job Position",
      company: company?.substring(0, 100),
      description: description || "No description available",
      rawContent: html,
      format: "url"
    };
  } catch (error) {
    throw new Error(`Failed to parse URL: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
function parseText(text) {
  const lines = text.split("\n").filter((l) => l.trim());
  const title = lines[0] || "Untitled Position";
  const company = lines[1]?.includes("@") || lines[1]?.includes("www.") ? void 0 : lines[1];
  return {
    title: title.substring(0, 200),
    company: company?.substring(0, 100),
    description: text,
    rawContent: text,
    format: "text"
  };
}
async function parseJobDescription(input, format) {
  if (typeof input === "string") {
    if (input.startsWith("http://") || input.startsWith("https://")) {
      return parseJobURL(input);
    }
    return parseText(input);
  }
  if (format === "pdf" || !format && input.slice(0, 4).toString() === "%PDF") {
    return parsePDF(input);
  }
  if (format === "docx" || !format && input.slice(0, 4).toString().includes("PK")) {
    return parseDOCX(input);
  }
  return parseText(input.toString());
}
export {
  parseJobDescription as p
};
