import {lpad} from './string';

export const toHex = (buffer: ArrayBuffer): string[] => {
	const output: string[] = [];

	for (const byte of (new Uint8Array(buffer)))
		output.push(lpad(byte.toString(16), 2, '0'));

	return output;
};
