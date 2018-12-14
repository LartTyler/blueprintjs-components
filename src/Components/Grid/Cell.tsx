import * as React from 'react';
import {IBreakpoints} from './Row';

export interface ICellProps {
	size: number | IBreakpoints<number>;
	offset?: number | IBreakpoints<number>;
	className?: string;
}

export const Cell: React.FC<ICellProps> = props => {
	const {size, offset} = props;

	const classes: string[] = [];

	if (typeof size === 'number')
		classes.push(`col-xs-${size}`);
	else
		Object.keys(size).forEach(breakpoint => classes.push(`col-${breakpoint}-${size[breakpoint]}`));

	if (typeof offset === 'number')
		classes.push(`col-xs-offset-${offset}`);
	else
		Object.keys(offset).forEach(breakpoint => classes.push(`col-${breakpoint}-offset-${offset[breakpoint]}`));

	return (
		<div className={`${classes.join(' ')} ${props.className || ''}`}>
			{props.children}
		</div>
	);
};

Cell.defaultProps = {
	offset: {},
};
