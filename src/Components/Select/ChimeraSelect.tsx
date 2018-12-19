import * as React from 'react';
import {Omit} from 'utility-types';
import {ICommonSelectProps} from './ICommonSelectProps';
import {IMultiSelectProps, MultiSelect} from './MultiSelect';
import {ISelectProps, Select} from './Select';

interface IProps<T, M extends boolean> extends ICommonSelectProps<T> {
	multi: M;
	onItemSelect: (item: T) => void;
	selected: M extends true ? T[] : T;

	selectProps?: Partial<Omit<M extends true ?
		Omit<IMultiSelectProps<T>, 'onClear' | 'onItemDeselect' | 'onItemSelect' | 'selected'> :
		Omit<ISelectProps<T>, 'onItemSelect' | 'selected'>,
		'items'>>;
}

interface ISingleProps<T> extends IProps<T, false> {
}

interface IMultiProps<T> extends IProps<T, true> {
	onClear: () => void;
	onItemDeselect: (removed: T) => void;
}

export type IChimeraSelectProps<T> = ISingleProps<T> | IMultiProps<T>;

export const ChimeraSelect: React.FC<IChimeraSelectProps<any>> = <T extends any>(props: IChimeraSelectProps<T>) => {
	if (props.multi) {
		return (
			<MultiSelect
				{...props.selectProps}
				items={props.items}
				onClear={props.onClear}
				onItemDeselect={props.onItemDeselect}
				onItemSelect={props.onItemSelect}
				selected={props.selected}
			/>
		);
	} else {
		return (
			<Select
				{...props.selectProps}
				items={props.items}
				onItemSelect={props.onItemSelect}
				selected={props.selected}
			/>
		);
	}
};
