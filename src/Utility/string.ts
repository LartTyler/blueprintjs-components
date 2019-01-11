export const lpad = (value: string, length: number, char: string = ' ') => {
	if (value.length > length)
		return value;

	return char.repeat(length - value.length) + value;
};
