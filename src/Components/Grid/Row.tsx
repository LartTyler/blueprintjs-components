import * as React from 'react';

export interface IBreakpoints<T> {
	xs?: T;
	sm?: T;
	md?: T;
	lg?: T;

	[key: string]: T;
}

export type Alignment = 'start' | 'center' | 'end';
export type VerticalAlignment = 'top' | 'middle' | 'bottom';
export type Distribution = 'around' | 'between';

export interface IRowProps {
	align?: Alignment | IBreakpoints<Alignment>;
	distribution?: Distribution | IBreakpoints<Distribution>;
	reverse?: boolean;
	style?: React.CSSProperties;
	verticalAlign?: VerticalAlignment | IBreakpoints<VerticalAlignment>;
}

export const Row: React.FC<IRowProps> = props => {
	const {align, verticalAlign, distribution} = props;

	const classes: string[] = [];

	if (typeof align === 'string')
		classes.push(`${align}-xs`);
	else if (align)
		Object.keys(align).forEach(breakpoint => classes.push(`${align}-${breakpoint}`));

	if (typeof verticalAlign === 'string')
		classes.push(`${verticalAlign}-xs`);
	else if (verticalAlign)
		Object.keys(verticalAlign).forEach(breakpoint => classes.push(`${verticalAlign}-${breakpoint}`));

	if (typeof distribution === 'string')
		classes.push(`${distribution}-xs`);
	else if (distribution)
		Object.keys(distribution).forEach(breakpoint => classes.push(`${distribution}-${breakpoint}`));

	if (props.reverse)
		classes.push('reverse');

	return (
		<div className={`row ${classes.join(' ')}`} style={props.style || {}}>
			{props.children}
		</div>
	);
};
