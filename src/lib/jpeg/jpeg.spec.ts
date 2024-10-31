import { describe, it, expect } from 'vitest';
import { readJpegComment, writeJpegComment } from '$lib/jpeg/comment';
import { generateSingleColorJpeg } from '$lib/jpeg/generate';

describe('Comment', () => {
	it('Generates a black jpeg with a comment', () => {
		const buffer = generateSingleColorJpeg(20, 20, 'black');
		const data = writeJpegComment(buffer, 'test comment');
		const comment = readJpegComment(data);
		expect(comment).toBe('test comment');
	});
});
