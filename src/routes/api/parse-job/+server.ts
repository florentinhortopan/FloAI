import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseJobDescription } from '$lib/jobParser';
import { prisma } from '$lib/db';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const url = formData.get('url') as string | null;
		const text = formData.get('text') as string | null;

		let parsed: Awaited<ReturnType<typeof parseJobDescription>>;

		if (file) {
			// File upload
			const buffer = Buffer.from(await file.arrayBuffer());
			const format = file.name.endsWith('.pdf')
				? 'pdf'
				: file.name.endsWith('.docx')
					? 'docx'
					: 'txt';
			parsed = await parseJobDescription(buffer, format);
		} else if (url) {
			// URL parsing
			parsed = await parseJobDescription(url, 'url');
		} else if (text) {
			// Plain text
			parsed = await parseJobDescription(text, 'text');
		} else {
			return json({ error: 'No file, URL, or text provided' }, { status: 400 });
		}

		// Store in database
		const jobDesc = await prisma.jobDescription.create({
			data: {
				url: parsed.format === 'url' ? (url || undefined) : undefined,
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
		console.error('Job parsing error:', error);
		return json(
			{
				error: 'Failed to parse job description',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
