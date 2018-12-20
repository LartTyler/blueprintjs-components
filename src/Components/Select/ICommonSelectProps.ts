import {IPopoverProps} from '@blueprintjs/core';
import {ItemListPredicate, ItemListRenderer, ItemPredicate, ItemRenderer} from '@blueprintjs/select';
import * as React from 'react';

export interface IVirtualConfiguration {
	maxHeight?: number;
	overscanRowCount?: number;
	rowHeight?: number;
}

export interface ICommonSelectProps<T> {
	/**
	 * The items to render in the select.
	 */
	items: T[];

	/**
	 * If set to `true`, the select and any child elements will be disabled.
	 */
	disabled?: boolean;

	/**
	 * A property of `T` that should be used for the item's `key` attribute (i.e. for the {@see MenuItem} element
	 * rendered in the select popover). If this property is not specified, the item itself is used as the key.
	 */
	itemKey?: keyof T;

	/**
	 * If provided, a callback to invoke to render the entire item list.
	 */
	itemListRenderer?: ItemListRenderer<T>;

	/**
	 * A callback that can be used to filter the entire item list.
	 */
	itemListPredicate?: ItemListPredicate<T>;

	/**
	 * A callback that can be used to filter the item list item-by-item. It will be invoked once for each element in
	 * {@see items}.
	 */
	itemPredicate?: ItemPredicate<T>;

	/**
	 * A replacement renderer for the built-in {@see MenuItem} renderer.
	 */
	itemRenderer?: ItemRenderer<T>

	/**
	 * A callback to use to render the display text of each item. If not provided, the item itself will be rendered
	 * instead.
	 */
	itemTextRenderer?: (item: T) => React.ReactNode;

	/**
	 * If `true`, the element defined by {@see loadingSpinner} will be rendered in place of the select.
	 */
	loading?: boolean;

	/**
	 * An override to replace the default spinner used by the select. If not provided, a Blueprint spinner with intent
	 * set to "primary" and size set to "small" will be used.
	 */
	loadingSpinner?: JSX.Element;

	/**
	 * Props to pass to the wrapped popover object.
	 */
	popoverProps?: Partial<IPopoverProps> & object;

	/**
	 * Whether or not the active item should be reset to the first matching item when an item is selected.
	 */
	resetOnSelect?: boolean;

	/**
	 * Whether or not the active item should be reset to the first matching item every time the query changes.
	 */
	resetOnQuery?: boolean;

	/**
	 * If true, the active item should be scrolled into view when initially displaying the select.
	 */
	scrollToActiveItem?: boolean;

	/**
	 * If true, items in the select will be rendered using the {@see List} component from `react-virtualized`.
	 */
	virtual?: boolean;

	/**
	 * Options for select virtualization. Ignored if {@see virtual} is `false`.
	 */
	virtualOptions?: IVirtualConfiguration;
}
