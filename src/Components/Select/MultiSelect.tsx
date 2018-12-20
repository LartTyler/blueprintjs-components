import {Button, Intent, ITagInputProps, MenuItem, Spinner} from '@blueprintjs/core';
import {IItemRendererProps, MultiSelect as BlueprintMultiSelect} from '@blueprintjs/select';
import * as React from 'react';
import {ICommonSelectProps} from './ICommonSelectProps';

const createItemRenderer = <T extends any>(props: IMultiSelectProps<T>) => {
	if (props.itemRenderer)
		return props.itemRenderer;

	return (item: T, rendererProps: IItemRendererProps) => {
		if (!rendererProps.modifiers.matchesPredicate)
			return null;

		let text: React.ReactNode = item;

		if (props.itemTextRenderer)
			text = props.itemTextRenderer(item);

		const key = (props.itemKey ? item[props.itemKey] as unknown : item) as React.Key;

		return (
			<MenuItem
				active={rendererProps.modifiers.active}
				icon={props.selected.indexOf(item) === -1 ? 'blank' : 'tick'}
				key={key}
				text={text}
				onClick={rendererProps.handleClick}
			/>
		);
	};
};

const createItemSelectHandler = <T extends any>(props: IMultiSelectProps<T>) => {
	return (item: T) => {
		if (props.selected.indexOf(item) === -1)
			props.onItemSelect(item);
		else
			props.onItemDeselect(item);
	};
};

const createTagRenderer = <T extends any>(props: IMultiSelectProps<T>) => {
	return props.tagRenderer || props.itemTextRenderer || ((item: T) => item);
};

export interface IMultiSelectProps<T> extends ICommonSelectProps<T> {
	/**
	 * A callback to invoke when the select's clear button is clicked.
	 */
	onClear: () => void;

	/**
	 * A callback to invoke when an item is deselected.
	 */
	onItemDeselect: (item: T) => void;

	/**
	 * A callback to invoke when an item is selected.
	 */
	onItemSelect: (item: T) => void;

	/**
	 * An array of items that should be rendered as selected.
	 */
	selected: T[];

	/**
	 * The placeholder text to render if no items have been selected yet.
	 */
	noItemSelected?: string;

	/**
	 * Props to pass to the the wrapped tag input.
	 */
	tagInputProps?: ITagInputProps;

	/**
	 * A replacement renderer for the built-in tag renderer (which renders a tag for the item by invoking
	 * {@see itemTextRenderer} if it's provided, or using the item itself).
	 */
	tagRenderer?: (item: T) => React.ReactNode;
}

export const MultiSelect: React.FC<IMultiSelectProps<any>> = <T extends any>(props: IMultiSelectProps<T>) => {
	if (props.loading) {
		return props.loadingSpinner || (
			<Spinner intent={Intent.PRIMARY} size={Spinner.SIZE_SMALL} />
		);
	}

	const tagInputProps = props.tagInputProps || {
		disabled: props.disabled,
		onRemove: (_value: string, index: number) => props.onItemDeselect(props.selected[index]),
		rightElement: props.selected.length > 0 && (
			<Button
				disabled={props.disabled}
				icon="cross"
				minimal={true}
				onClick={props.onClear}
			/>
		),
	};

	return (
		<BlueprintMultiSelect
			items={props.items}
			itemRenderer={createItemRenderer(props)}
			onItemSelect={createItemSelectHandler(props)}
			placeholder={props.noItemSelected}
			popoverProps={props.popoverProps}
			resetOnQuery={props.resetOnQuery}
			resetOnSelect={props.resetOnSelect}
			selectedItems={props.selected}
			tagRenderer={createTagRenderer(props)}
			tagInputProps={tagInputProps}
		/>
	);
};
