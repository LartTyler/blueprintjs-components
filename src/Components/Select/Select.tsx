import {Button, IButtonProps, Intent, MenuItem, Spinner} from '@blueprintjs/core';
import {IItemRendererProps, ItemRenderer, Select as BlueprintSelect} from '@blueprintjs/select';
import * as React from 'react';
import {ICommonSelectProps} from './ICommonSelectProps';

const createItemRenderer = <T extends any>(props: ISelectProps<T>): ItemRenderer<T> => {
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
				icon={item === props.selected ? 'tick' : 'blank'}
				key={key}
				text={text}
				onClick={rendererProps.handleClick}
			/>
		);
	};
};

const renderTarget = <T extends any>(props: ISelectProps<T>) => {
	if (props.targetRenderer)
		return props.targetRenderer(props.selected);

	let selected: any = props.selected;

	if (!selected)
		selected = props.noItemSelected;
	else if (props.itemTextRenderer)
		selected = props.itemTextRenderer(selected);

	return (
		<Button {...props.buttonProps}>
			{selected}
		</Button>
	);
};

export interface ISelectProps<T> extends ICommonSelectProps<T> {
	/**
	 * A callback to invoke when an item is selected.
	 */
	onItemSelect: (selected: T) => void;

	/**
	 * The currently selected value.
	 */
	selected: T;

	/**
	 * Props to pass to the wrapped button. If {@see targetRenderer} is provided, this property is ignored.
	 */
	buttonProps?: IButtonProps;

	/**
	 * Whether or not the item list is filterable. If `false`, no search components will be rendered in the list.
	 */
	filterable?: boolean;

	/**
	 * Default text to render if no items are selected. If {@see targetRenderer} is provided, this property is ignored.
	 */
	noItemSelected?: React.ReactNode;

	/**
	 * Default text to render if a predicate matches no items.
	 */
	noResults?: React.ReactNode;

	/**
	 * An array of items that should be omitted from the list.
	 */
	omit?: T[];

	/**
	 * Whether or not the active item should reset to the first matched item every time the list closes.
	 */
	resetOnClose?: boolean;

	/**
	 * An override for the built-in popover target renderer. If not provided, a button will be rendered containing
	 * the currently selected items text, or {@see noItemSelected} if {@see selected} is a false-y value.
	 */
	targetRenderer?: (selected: T) => React.ReactNode;
}

export const Select: React.FC<ISelectProps<any>> = <T extends {}>(props: ISelectProps<T>) => {
	if (props.loading) {
		return props.loadingSpinner || (
			<Spinner intent={Intent.PRIMARY} size={Spinner.SIZE_SMALL} />
		);
	}

	let items = props.items;

	if (props.omit && props.omit.length)
		items = items.filter(item => props.omit.indexOf(item) === -1);

	return (
		<BlueprintSelect
			disabled={props.disabled}
			filterable={props.filterable && (props.itemListPredicate !== null || props.itemPredicate !== null)}
			items={items}
			itemListPredicate={props.itemListPredicate}
			itemPredicate={props.itemPredicate}
			itemRenderer={createItemRenderer(props)}
			noResults={props.noResults}
			onItemSelect={props.onItemSelect}
			popoverProps={props.popoverProps}
			resetOnClose={props.resetOnClose}
			resetOnQuery={props.resetOnQuery}
			resetOnSelect={props.resetOnSelect}
		>
			{renderTarget(props)}
		</BlueprintSelect>
	);
};

Select.defaultProps = {
	buttonProps: {
		alignText: 'left',
		fill: true,
		rightIcon: 'caret-down',
	},
	disabled: false,
	loading: false,
	noItemSelected: 'Make a selection...',
	noResults: 'No items match your search.',
	resetOnClose: true,
};
