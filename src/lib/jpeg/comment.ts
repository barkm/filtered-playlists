import { Buffer } from 'buffer';

const START_MARKER = Buffer.from([0xff, 0xd8]);
const COMMENT_MARKER = Buffer.from([0xff, 0xfe]);
const COMMENT_LENGTH_BUFFER_LENGTH = 2;

export const writeJpegComment = (dataUrl: string, comment: string): string => {
	const buffer = dataUrlToBuffer(dataUrl);
	const buffer_with_comment = overwriteComment(buffer, comment);
	return bufferToDataUrl(buffer_with_comment);
};

export const readJpegComment = (data: string) => {
	const buffer = dataUrlToBuffer(data);
	return readComment(buffer);
};

export const removeDataUrlPrefix = (dataUrl: string): string => {
	return dataUrl.replace(/^data:image\/\w+;base64,/, '');
};

const dataUrlToBuffer = (dataUrl: string): Buffer => {
	const binaryArray = dataUrlToUint8Array(dataUrl);
	return Buffer.from(binaryArray);
};

const dataUrlToUint8Array = (dataUrl: string): Uint8Array => {
	const base64Data = removeDataUrlPrefix(dataUrl);
	const binaryString = atob(base64Data);
	const binaryArray = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		binaryArray[i] = binaryString.charCodeAt(i);
	}
	return binaryArray;
};

const overwriteComment = (buffer: Buffer, comment: string): Buffer => {
	const comment_length = encodeCommentLength(comment.length);
	const comment_data = Buffer.from(comment);
	const start_buffer = buffer.subarray(0, START_MARKER.length);
	const data_buffer = getDataBuffer(buffer);
	return Buffer.concat([start_buffer, COMMENT_MARKER, comment_length, comment_data, data_buffer]);
};

const getDataBuffer = (buffer: Buffer): Buffer => {
	try {
		const comment_offset = getCommentOffset(buffer);
		const comment_length = buffer.readUInt16BE(comment_offset + COMMENT_MARKER.length);
		const comment_length_offset = comment_offset + COMMENT_MARKER.length + 2;
		const commend_end_offset = comment_length_offset + comment_length - 2;
		return buffer.subarray(commend_end_offset);
	} catch (e) {
		return buffer.subarray(START_MARKER.length);
	}
};

const readComment = (buffer: Buffer): string => {
	return getCommentBuffer(buffer).toString('utf-8');
};

const getCommentBuffer = (buffer: Buffer): Buffer => {
	const { start, end } = getCommentBufferOffsets(buffer);
	return buffer.subarray(start, end);
};

const getCommentBufferOffsets = (buffer: Buffer): { start: number; end: number } => {
	const comment_offset = getCommentOffset(buffer);
	const comment_length = decodeCommentLength(
		buffer.subarray(comment_offset + COMMENT_MARKER.length)
	);
	const start = comment_offset + COMMENT_MARKER.length + COMMENT_LENGTH_BUFFER_LENGTH;
	const end = start + comment_length;
	return { start, end };
};

const getCommentOffset = (buffer: Buffer): number => {
	let offset = 0;
	while (offset < buffer.length) {
		if (buffer.subarray(offset, offset + 2).equals(COMMENT_MARKER)) {
			return offset;
		}
		offset++;
	}
	throw new Error('No comment marker found in buffer.');
};

const encodeCommentLength = (length: number): Buffer => {
	return Buffer.from([(length + 2) >> 8, (length + 2) & 0xff]);
};

const decodeCommentLength = (buffer: Buffer): number => {
	if (buffer.length < COMMENT_LENGTH_BUFFER_LENGTH) {
		throw new Error('Invalid buffer length');
	}
	return buffer.readUInt16BE(0) - 2;
};

const bufferToDataUrl = (buffer: Buffer): string => {
	return 'data:image/jpeg;base64,' + buffer.toString('base64');
};
