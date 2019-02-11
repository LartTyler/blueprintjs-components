import {Button, ButtonGroup, IconName, Intent, MaybeElement} from '@blueprintjs/core';
import * as React from 'react';

export interface IPageButtonRendererProps {
	active: boolean;
	activeIntent: Intent;
	onClick: () => void;
	page: number;
}

export type PageButtonRenderer = (props: IPageButtonRendererProps) => React.ReactNode;

export type JumpButtonType = 'first' | 'last' | 'previous' | 'next';

export type MaybeIcon = IconName | MaybeElement;

export interface IJumpButtonRendererProps {
	disabled: boolean;
	icon: MaybeIcon;
	onClick: () => void;
	type: JumpButtonType;
}

export type JumpButtonRenderer = (props: IJumpButtonRendererProps) => React.ReactNode;

export type PageCountPosition = 'left' | 'right';

export interface IPageCountRendererProps {
	currentPage: number;
	pages: number;
	position: PageCountPosition;
}

export type PageCountRenderer = (props: IPageCountRendererProps) => React.ReactNode;

export type PageButtonClickHandler = (page: number, jumpType: JumpButtonType | null) => void;

export interface IPaginationProps {
	/**
	 * The number of pages to render in the paginator.
	 */
	pages: number;

	/**
	 * The intent to apply to the active item.
	 */
	activeItemIntent?: Intent;

	/**
	 * The icon or element to use for the first page button.
	 */
	firstPageIcon?: MaybeIcon;

	/**
	 * A replacement renderer for any jump buttons (first, last, next, and previous).
	 */
	jumpButtonRenderer?: JumpButtonRenderer;

	/**
	 * The icon or element to use for the last page button.
	 */
	lastPageIcon?: MaybeIcon;

	/**
	 * The icon or element to use for the next page button.
	 */
	nextPageIcon?: MaybeIcon;

	/**
	 * A callback to invoke when the active page changes. If a jump button was clicked, the `jumpType` argument will be
	 * set to a {@see JumpButtonType}. If a page button is set, `jumpType` will be null.
	 */
	onChange?: PageButtonClickHandler;

	/**
	 * The number of page buttons to render on either side of the active page button.
	 */
	padding?: number;

	/**
	 * If provided, the `page` state of the component will be controlled by the parent component.
	 */
	page?: number;

	/**
	 * A replacement renderer for page buttons.
	 */
	pageButtonRenderer?: PageButtonRenderer;

	/**
	 * If {@see showPageCount} is `true`, this prop specifies which side of the pagination component the count element
	 * should be rendered.
	 */
	pageCountPosition?: PageCountPosition;

	/**
	 * A replacement renderer for the page count. If {@see showPageCount} is `false`, this callback will not be invoked.
	 */
	pageCountRenderer?: PageCountRenderer;

	/**
	 * The icon or element to use for the previous page button.
	 */
	previousPageIcon?: MaybeIcon;

	/**
	 * If `false`, do not render the page count.
	 */
	showPageCount?: boolean;
}

interface IState {
	page: number;
}

export class Pagination extends React.PureComponent<IPaginationProps, IState> {
	public static defaultProps: Partial<IPaginationProps> = {
		activeItemIntent: Intent.PRIMARY,
		firstPageIcon: 'double-chevron-left',
		lastPageIcon: 'double-chevron-right',
		nextPageIcon: 'chevron-right',
		padding: 2,
		pageCountPosition: 'right',
		previousPageIcon: 'chevron-left',
		showPageCount: true,
	};

	public state: Readonly<IState> = {
		page: 1,
	};

	public render(): React.ReactNode {
		const page = this.props.page || this.state.page;

		const buttons: React.ReactNode[] = [];

		const fullPadding = this.props.padding * 2;
		const lastPage = Math.min(Math.max(page - this.props.padding, 1) + fullPadding, this.props.pages);

		const pageButtonRenderer = this.props.pageButtonRenderer || this.renderDefaultPageButton;

		for (let i = Math.max(lastPage - fullPadding, 1); i <= lastPage; i++) {
			buttons.push(pageButtonRenderer({
				active: i === page,
				activeIntent: this.props.activeItemIntent,
				onClick: () => this.setPage(i),
				page: i,
			}));
		}

		const jumpButtonRenderer = this.props.jumpButtonRenderer || this.renderDefaultJumpButton;

		const pageCount = this.props.showPageCount && (this.props.pageCountRenderer || this.renderDefaultPageCount)({
			currentPage: page,
			pages: this.props.pages,
			position: this.props.pageCountPosition,
		});

		return (
			<>
				{this.props.pageCountPosition === 'left' && pageCount}

				<ButtonGroup>
					{jumpButtonRenderer({
						disabled: page === 1,
						icon: this.props.firstPageIcon,
						onClick: this.onFirstPageClick,
						type: 'first',
					})}

					{jumpButtonRenderer({
						disabled: page === 1,
						icon: this.props.previousPageIcon,
						onClick: this.onPreviousPageClick,
						type: 'previous',
					})}

					{buttons}

					{jumpButtonRenderer({
						disabled: page === this.props.pages,
						icon: this.props.nextPageIcon,
						onClick: this.onNextPageClick,
						type: 'next',
					})}

					{jumpButtonRenderer({
						disabled: page === this.props.pages,
						icon: this.props.lastPageIcon,
						onClick: this.onLastPageClick,
						type: 'last',
					})}
				</ButtonGroup>

				{this.props.pageCountPosition === 'right' && pageCount}
			</>
		);
	}

	private renderDefaultJumpButton: JumpButtonRenderer = props => (
		<Button
			disabled={props.disabled}
			icon={props.icon}
			onClick={props.onClick}
		/>
	);

	private renderDefaultPageButton: PageButtonRenderer = props => (
		<Button
			intent={props.active ? props.activeIntent : Intent.NONE}
			key={props.page}
			onClick={props.onClick}
		>
			{props.page}
		</Button>
	);

	private renderDefaultPageCount: PageCountRenderer = props => {
		const style: React.CSSProperties = {
			display: 'inline-block',
			position: 'relative',
			top: -4,
		};

		if (props.position === 'left')
			style.right = 8;
		else
			style.left = 8;

		return (
			<div style={style}>
				{props.currentPage} / {props.pages}
			</div>
		);
	};

	private onFirstPageClick = () => this.setPage(1, 'first');

	private onLastPageClick = () => this.setPage(this.props.pages, 'last');

	private onNextPageClick = () => this.setPage(
		Math.min((this.props.page || this.state.page) + 1, this.props.pages),
		'next',
	);

	private onPreviousPageClick = () => this.setPage(Math.max((this.props.page || this.state.page) - 1, 1), 'previous');

	private setPage = (page: number, jumpType?: JumpButtonType) => {
		this.setState({
			page,
		});

		if (this.props.onChange)
			this.props.onChange(page, jumpType || null);
	};
}
