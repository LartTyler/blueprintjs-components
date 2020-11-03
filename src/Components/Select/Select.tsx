import {Button, IButtonProps, Intent, IResizeEntry, Menu, MenuItem, ResizeSensor, Spinner} from '@blueprintjs/core';
import {IItemRendererProps, isCreateNewItem, ItemListRenderer, Select as BlueprintSelect} from '@blueprintjs/select';
import * as React from 'react';
import {List} from 'react-virtualized';
import {ICommonSelectProps} from './ICommonSelectProps';

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
	 * Whether or not the active item should reset to the first matched item every time the list closes.
	 */
	resetOnClose?: boolean;

	/**
	 * An override for the built-in popover target renderer. If not provided, a button will be rendered containing
	 * the currently selected items text, or {@see noItemSelected} if {@see selected} is a false-y value.
	 */
	targetRenderer?: (selected: T) => React.ReactNode;
}

interface IState {
	width: number;
}

export class Select<T> extends React.PureComponent<ISelectProps<T>, IState> {
	public static defaultProps: Partial<ISelectProps<unknown>> = {
		buttonProps: {
			alignText: 'left',
			fill: true,
			rightIcon: 'caret-down',
		},
		noItemSelected: 'Make a selection...',
		noResults: 'No items match your search.',
		resetOnClose: true,
		scrollToActiveItem: true,
		virtualOptions: {
			maxHeight: 300,
			rowHeight: 30,
		},
	};

	public state: Readonly<IState> = {
		width: 0,
	};

	public render(): React.ReactNode {
		if (this.props.loading) {
			return this.props.loadingSpinner || (
				<Spinner intent={Intent.PRIMARY} size={Spinner.SIZE_SMALL} />
			);
		}

		let items = this.props.items;

		if (this.props.omit && this.props.omit.length)
			items = this.compareOmitItemList(items, this.props.omit);

		let target: React.ReactNode;

		if (this.props.targetRenderer)
			target = this.props.targetRenderer(this.props.selected);
		else {
			let selected: any = this.props.selected;

			if (!selected)
				selected = this.props.noItemSelected;
			else if (this.props.itemTextRenderer)
				selected = this.props.itemTextRenderer(selected);

			const disabled = typeof this.props.buttonProps.disabled !== 'undefined' ?
				this.props.buttonProps.disabled :
				this.props.disabled;

			target = (
				<Button {...this.props.buttonProps} disabled={disabled}>
					{selected}
				</Button>
			);
		}

		return (
			<BlueprintSelect
				disabled={this.props.disabled}
				filterable={this.isFilterable()}
				items={items}
				itemListRenderer={this.isVirtual() ? this.renderVirtualItemList : this.props.itemListRenderer}
				itemListPredicate={this.props.itemListPredicate}
				itemPredicate={this.props.itemPredicate}
				itemRenderer={this.props.itemRenderer || this.renderItem}
				itemsEqual={this.props.itemsEqual}
				noResults={this.props.noResults}
				onItemSelect={this.props.onItemSelect}
				popoverProps={this.props.popoverProps}
				resetOnClose={this.props.resetOnClose}
				resetOnQuery={this.props.resetOnQuery}
				resetOnSelect={this.props.resetOnSelect}
				scrollToActiveItem={this.props.scrollToActiveItem}
			>
				{target}
			</BlueprintSelect>
		);
	}

	private renderVirtualItemList: ItemListRenderer<T> = props => {
		const options = this.props.virtualOptions;
		const items = props.filteredItems;

		const height = Math.min(options.maxHeight, items.length * options.rowHeight);

		let scrollIndex: number = undefined;

		if (this.props.scrollToActiveItem && !isCreateNewItem(props.activeItem))
			scrollIndex = items.indexOf(props.activeItem) + 1;

		return (
			<div>
				<ResizeSensor onResize={this.onMenuResize}>
					<Menu ulRef={this.handleMenuRef}>
						<List
							height={height}
							rowHeight={options.rowHeight}
							rowCount={items.length}
							width={this.state.width}
							rowRenderer={({key, style, index}) => (
								<div key={key} style={style}>
									{props.renderItem(items[index], index)}
								</div>
							)}
							overscanRowCount={options.overscanRowCount}
							scrollToIndex={scrollIndex}
						/>
					</Menu>
				</ResizeSensor>
			</div>
		);
	};

	private renderItem = (item: T, props: IItemRendererProps) => {
		if (!props.modifiers.matchesPredicate)
			return null;

		let text: React.ReactNode = item;

		if (this.props.itemTextRenderer)
			text = this.props.itemTextRenderer(item);

		const key = (this.props.itemKey ? item[this.props.itemKey] as unknown : item) as React.Key;

		return (
			<MenuItem
				active={props.modifiers.active}
				icon={this.compareItems(item, this.props.selected) ? 'tick' : 'blank'}
				key={key}
				text={text}
				onClick={props.handleClick}
			/>
		);
	};

	private handleMenuRef = (ref: HTMLUListElement) => {
		if (!ref) {
			this.setState({
				width: 0,
			});

			return;
		}

		ref.style.overflow = 'hidden';

		this.setState({
			width: ref.offsetWidth,
		});
	};

	private onMenuResize = (entries: IResizeEntry[]) => this.setState({
		width: entries[0].contentRect.width,
	});

	private isFilterable = () => {
		const props = this.props;

		return props.filterable && (props.itemListPredicate !== null || props.itemPredicate !== null);
	};

	private isVirtual = () => this.props.virtual;

	private compareOmitItemList = (source: T[], omit: T[]) => {
		return source.filter(item => omit.find(omission => this.compareItems(item, omission)) === undefined);
	};

	private compareItems = (a: T, b: T) => {
		if (typeof this.props.itemsEqual === 'string')
			return a[this.props.itemsEqual] === b[this.props.itemsEqual];
		else if (typeof this.props.itemsEqual === 'function')
			return this.props.itemsEqual(a, b);

		return a === b;
	};
}
