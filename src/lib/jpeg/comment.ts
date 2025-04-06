import { Buffer } from 'buffer';

const START_MARKER = Buffer.from([0xff, 0xd8]);
const COMMENT_MARKER = Buffer.from([0xff, 0xfe]);

export const writeJpegComment = (dataUrl: string, comment: string): string => {
	const buffer = dataUrlToBuffer(dataUrl);
	const buffer_with_comment = writeComment(buffer, comment);
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

const writeComment = (buffer: Buffer, comment: string): Buffer => {
	const comment_length = encodeCommentLength(comment.length);
	const comment_data = Buffer.from(comment);
	const start_buffer = buffer.subarray(0, START_MARKER.length);
	const data_buffer = buffer.subarray(START_MARKER.length);
	return Buffer.concat([start_buffer, COMMENT_MARKER, comment_length, comment_data, data_buffer]);
};

const encodeCommentLength = (length: number): Buffer => {
	return Buffer.from([(length + 2) >> 8, (length + 2) & 0xff]);
};

const readComment = (buffer: Buffer): string => {
	const comment_offset = getCommentOffset(buffer);
	return readJpegCommentFromOffset(buffer, comment_offset);
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

const readJpegCommentFromOffset = (buffer: Buffer, offset: number): string => {
	const comment_length = buffer.readUInt16BE(offset + COMMENT_MARKER.length);
	const comment_length_offset = offset + COMMENT_MARKER.length + 2;
	const commend_end_offset = comment_length_offset + comment_length - 2;
	const comment_buffer = buffer.subarray(comment_length_offset, commend_end_offset);
	return comment_buffer.toString('utf-8');
};

const bufferToDataUrl = (buffer: Buffer): string => {
	return 'data:image/jpeg;base64,' + buffer.toString('base64');
};
