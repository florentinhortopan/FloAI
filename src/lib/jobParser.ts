// @ts-ignore - pdf-parse doesn't have types
import pdfParse from 'pdf-parse';
import * as cheerio from 'cheerio';
// @ts-ignore - mammoth types may be incomplete
import mammoth from 'mammoth';

export interface ParsedJobDescription {
	title: string;
	company?: string;
	description: string;
	rawContent: string;
	format: 'pdf' | 'docx' | 'txt' | 'url' | 'text';
}

/**
 * Parse PDF file
 */
export async function parsePDF(buffer: Buffer): Promise<ParsedJobDescription> {
	try {
		const data = await pdfParse(buffer);
		const text = data.text;

		// Try to extract title and company from first few lines
		const lines = text.split('\n').filter((l) => l.trim());
		const title = lines[0] || 'Untitled Position';
		const company = lines[1]?.includes('@') || lines[1]?.includes('www.')
			? undefined
			: lines[1];

		return {
			title: title.substring(0, 200),
			company: company?.substring(0, 100),
			description: text,
			rawContent: text,
			format: 'pdf'
		};
	} catch (error) {
		throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Parse DOCX file
 */
export async function parseDOCX(buffer: Buffer): Promise<ParsedJobDescription> {
	try {
		const result = await mammoth.extractRawText({ buffer });
		const text = result.value;

		const lines = text.split('\n').filter((l) => l.trim());
		const title = lines[0] || 'Untitled Position';
		const company = lines[1]?.includes('@') || lines[1]?.includes('www.')
			? undefined
			: lines[1];

		return {
			title: title.substring(0, 200),
			company: company?.substring(0, 100),
			description: text,
			rawContent: text,
			format: 'docx'
		};
	} catch (error) {
		throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Scrape job description from URL (LinkedIn, Indeed, etc.)
 */
export async function parseJobURL(url: string): Promise<ParsedJobDescription> {
	try {
		// Use a proxy or server-side fetch since we're in a serverless environment
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch URL: ${response.statusText}`);
		}

		const html = await response.text();
		const $ = cheerio.load(html);

		// LinkedIn job posting selectors
		let title = $('h1.top-card-layout__title').text().trim() ||
			$('h1.job-details-jobs-unified-top-card__job-title').text().trim() ||
			$('h1[data-test-id="job-title"]').text().trim();

		let company = $('a.topcard__org-name-link').text().trim() ||
			$('a.job-details-jobs-unified-top-card__company-name').text().trim() ||
			$('[data-test-id="job-company"]').text().trim();

		let description = $('.show-more-less-html__markup').text().trim() ||
			$('.description__text').text().trim() ||
			$('[data-test-id="job-description"]').text().trim() ||
			$('.jobs-description-content__text').text().trim();

		// Indeed job posting selectors
		if (!description) {
			title = title || $('h1.jobsearch-JobInfoHeader-title').text().trim();
			company = company || $('[data-testid="inlineHeader-companyName"]').text().trim();
			description = description || $('#jobDescriptionText').text().trim();
		}

		// Fallback: extract from meta tags or body text
		if (!title) {
			title = $('meta[property="og:title"]').attr('content') ||
				$('title').text().trim() ||
				'Job Position';
		}

		if (!description) {
			// Try to get main content
			description = $('main').text().trim() ||
				$('article').text().trim() ||
				$('.job-description').text().trim() ||
				$('body').text().trim().substring(0, 5000);
		}

		return {
			title: title.substring(0, 200) || 'Job Position',
			company: company?.substring(0, 100),
			description: description || 'No description available',
			rawContent: html,
			format: 'url'
		};
	} catch (error) {
		throw new Error(`Failed to parse URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Parse plain text job description
 */
export function parseText(text: string): ParsedJobDescription {
	const lines = text.split('\n').filter((l) => l.trim());
	const title = lines[0] || 'Untitled Position';
	const company = lines[1]?.includes('@') || lines[1]?.includes('www.')
		? undefined
		: lines[1];

	return {
		title: title.substring(0, 200),
		company: company?.substring(0, 100),
		description: text,
		rawContent: text,
		format: 'text'
	};
}

/**
 * Auto-detect format and parse job description
 */
export async function parseJobDescription(
	input: string | Buffer,
	format?: 'pdf' | 'docx' | 'txt' | 'url' | 'text'
): Promise<ParsedJobDescription> {
	if (typeof input === 'string') {
		// Check if it's a URL
		if (input.startsWith('http://') || input.startsWith('https://')) {
			return parseJobURL(input);
		}
		// Plain text
		return parseText(input);
	}

	// Buffer input (file)
	if (format === 'pdf' || (!format && input.slice(0, 4).toString() === '%PDF')) {
		return parsePDF(input);
	}

	if (format === 'docx' || (!format && input.slice(0, 4).toString().includes('PK'))) {
		return parseDOCX(input);
	}

	// Default to text
	return parseText(input.toString());
}
