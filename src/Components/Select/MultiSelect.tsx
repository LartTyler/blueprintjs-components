import {Button, Intent, IResizeEntry, ITagInputProps, Menu, MenuItem, ResizeSensor, Spinner} from '@blueprintjs/core';
import {IItemRendererProps, ItemListRenderer, MultiSelect as BlueprintMultiSelect} from '@blueprintjs/select';
import * as React from 'react';
import {List} from 'react-virtualized';
import {ICommonSelectProps} from './ICommonSelectProps';

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

interface IState {
	width: number;
}

export class MultiSelect<T> extends React.PureComponent<IMultiSelectProps<T>, IState> {
	public static defaultProps: Partial<IMultiSelectProps<any>> = {
		noItemSelected: 'Make a selection...',
		scrollToActiveItem: true,
		virtualOptions: {
			maxHeight: 297,
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

		const tagInputProps = this.props.tagInputProps || {
			disabled: this.props.disabled,
			onRemove: (_value: string, index: number) => this.props.onItemDeselect(this.props.selected[index]),
			rightElement: this.props.selected.length > 0 && (
				<Button
					disabled={this.props.disabled}
					icon="cross"
					minimal={true}
					onClick={this.props.onClear}
				/>
			),
		};

		return (
			<BlueprintMultiSelect
				itemListPredicate={this.props.itemListPredicate}
				itemPredicate={this.props.itemPredicate}
				items={this.props.items}
				itemListRenderer={this.isVirtual() ? this.renderVirtualItemList : this.props.itemListRenderer}
				itemRenderer={this.props.itemRenderer || this.renderItem}
				onItemSelect={this.onItemSelect}
				placeholder={this.props.noItemSelected}
				popoverProps={this.props.popoverProps}
				resetOnQuery={this.props.resetOnQuery}
				resetOnSelect={this.props.resetOnSelect}
				selectedItems={this.props.selected}
				scrollToActiveItem={this.props.scrollToActiveItem}
				tagRenderer={this.props.tagRenderer || this.props.itemTextRenderer || this.renderTag}
				tagInputProps={tagInputProps}
			/>
		);
	}

	private renderVirtualItemList: ItemListRenderer<T> = props => {
		const options = this.props.virtualOptions;
		const items = props.filteredItems;

		const height = Math.min(options.maxHeight, items.length * options.rowHeight);

		let scrollIndex: number = undefined;

		if (this.props.scrollToActiveItem)
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
				icon={this.props.selected.indexOf(item) !== -1 ? 'tick' : 'blank'}
				key={key}
				text={text}
				onClick={props.handleClick}
			/>
		);
	};

	private renderTag = (item: T) => item;

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

	private onItemSelect = (item: T) => {
		if (this.props.selected.indexOf(item) === -1)
			this.props.onItemSelect(item);
		else
			this.props.onItemDeselect(item);
	};

	private onMenuResize = (entries: IResizeEntry[]) => this.setState({
		width: entries[0].contentRect.width,
	});

	private isVirtual = () => this.props.virtual;
}
