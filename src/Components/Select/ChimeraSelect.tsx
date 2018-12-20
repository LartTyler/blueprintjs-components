import * as React from 'react';
import {ICommonSelectProps} from './ICommonSelectProps';
import {IMultiSelectProps, MultiSelect} from './MultiSelect';
import {ISelectProps, Select} from './Select';

interface IProps<T, M extends boolean> extends ICommonSelectProps<T> {
	/**
	 * Whether or not the select is a multi-select.
	 */
	multi: M;
}

interface ISingleProps<T> extends IProps<T, false>, ISelectProps<T> {
}

interface IMultiProps<T> extends IProps<T, true>, IMultiSelectProps<T> {
}

export type ChimeraSelectProps<T> = ISingleProps<T> | IMultiProps<T>;

export const ChimeraSelect: React.FC<ChimeraSelectProps<any>> = <T extends any>(props: ChimeraSelectProps<T>) => {
	if (props.multi)
		return <MultiSelect {...props as IMultiProps<T>} />;
	else
		return <Select {...props as ISingleProps<T>} />;
};
