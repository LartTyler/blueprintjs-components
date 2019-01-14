import {Colors, Intent, ProgressBar} from '@blueprintjs/core';
import {debounce} from 'debounce';
import * as React from 'react';
import {toHex} from '../../Utility/buffer';
import {Cell, Row} from '../Grid';

export type PasswordStrengthChangeCallback = (strength: number, compromised: boolean) => void;

export interface IStrengthLevel {
	intent: Intent;
	label: React.ReactNode;
	value: number;
}

const defaultStrengths: IStrengthLevel[] = [
	{
		intent: Intent.DANGER,
		label: 'N/A',
		value: 0,
	},
	{
		intent: Intent.DANGER,
		label: 'Very Poor',
		value: 1,
	},
	{
		intent: Intent.DANGER,
		label: 'Poor',
		value: 2,
	},
	{
		intent: Intent.WARNING,
		label: 'Ok',
		value: 3,
	},
	{
		intent: Intent.WARNING,
		label: 'Good',
		value: 4,
	},
	{
		intent: Intent.SUCCESS,
		label: 'Excellent',
		value: 5,
	},
];

export type PasswordStrengthTest = (password: string) => number;

const defaultTestRegexes = [
	/[A-Z]/,
	/[a-z]/,
	/\d/,
	/[!@#$%^&*(),.?"':;\[\]{}|<>\-_+\/\\]/,
];

const defaultStrengthTests: PasswordStrengthTest[] = [
	(password: string) => {
		if (password.length === 0)
			return 0;

		let strength: number = 1;

		for (const regex of defaultTestRegexes) {
			if (regex.test(password))
				++strength;
		}

		return strength;
	},
];

export interface IHashStats {
	compromised: boolean;
	hash: string;
	strength: number;
}

export type FetchHashStatsCallback = (
	password: string,
	tests: PasswordStrengthTest[],
	compromisedHashes?: string[],
) => Promise<IHashStats>;

export const getHIBPHashStats: FetchHashStatsCallback = (password, tests, compromisedHashes) => {
	const encoder = new TextEncoder();

	return new Promise(resolve => {
		window.crypto.subtle.digest('sha-1', encoder.encode(password)).then(digest => {
			const hash = toHex(digest).join('').toUpperCase();

			for (const item of compromisedHashes) {
				if (item.toUpperCase() === hash) {
					return resolve({
						compromised: true,
						hash,
						strength: 0,
					});
				}
			}

			const prefix = hash.substr(0, 5);

			fetch(`https://api.pwnedpasswords.com/range/${prefix}`)
				.then(response => response.text())
				.then(suffixes => {
					let compromised = false;

					for (const item of suffixes.split('\n')) {
						const suffix = item.substr(0, item.indexOf(':'));

						if (hash === prefix + suffix) {
							compromised = true;

							break;
						}
					}

					let strength = 0;

					if (!compromised) {
						for (const test of tests)
							strength += test(password);
					}

					return resolve({
						compromised,
						hash,
						strength,
					});
				});
		});
	});
};

export interface IPasswordStrengthMeterProps {
	password: string;

	compromisedHashes?: string[];
	compromisedIntent?: Intent;
	compromisedLabel?: React.ReactNode;
	compromisedPasswordWarning?: React.ReactNode;
	onChange?: PasswordStrengthChangeCallback;
	onFetchHashStats?: FetchHashStatsCallback;
	onFetchHashStatsDebounce?: number;
	processingIntent?: Intent;
	processingLabel?: React.ReactNode;
	rightElement?: React.ReactNode;
	strengths?: IStrengthLevel[];
	strengthLabelPrefix?: React.ReactNode;
	strengthTests?: PasswordStrengthTest[];
}

interface IState {
	compromised: boolean;
	hash: string;
	processing: boolean;
	strength: number;
}

export class PasswordStrengthMeter extends React.PureComponent<IPasswordStrengthMeterProps, IState> {
	public static defaultProps: Partial<IPasswordStrengthMeterProps> = {
		compromisedIntent: Intent.DANGER,
		compromisedLabel: 'Compromised...',
		compromisedPasswordWarning: (
			<p style={{color: Colors.RED4, marginTop: 5}}>
				The password you entered is in a database of compromised passwords. Please choose another.
			</p>
		),
		onFetchHashStats: getHIBPHashStats,
		onFetchHashStatsDebounce: 350,
		processingIntent: Intent.PRIMARY,
		processingLabel: 'Processing...',
		strengths: defaultStrengths,
		strengthLabelPrefix: 'Strength: ',
		strengthTests: defaultStrengthTests,
	};

	public state: Readonly<IState> = {
		compromised: false,
		hash: null,
		processing: false,
		strength: 0,
	};

	public componentDidMount(): void {
		this.doUpdateHashStatsDebounced = this.createDebouncedHashStatsUpdate();

		this.updateHashStats();
	}

	public componentDidUpdate(prevProps: Readonly<IPasswordStrengthMeterProps>): void {
		if (prevProps.password === this.props.password)
			return;

		if (prevProps.onFetchHashStatsDebounce !== this.props.onFetchHashStatsDebounce)
			this.doUpdateHashStatsDebounced = this.createDebouncedHashStatsUpdate();

		this.updateHashStats();
	}

	public render(): React.ReactNode {
		let intent = this.props.processingIntent;
		let label = this.props.processingLabel;

		if (this.state.compromised) {
			intent = this.props.compromisedIntent;
			label = this.props.compromisedLabel;
		} else if (!this.state.processing) {
			const strengths = this.props.strengths;

			for (let i = strengths.length - 1; i >= 0; i--) {
				if (strengths[i].value >= this.state.strength) {
					intent = strengths[i].intent;
					label = strengths[i].label;

					break;
				}
			}
		}

		return (
			<div style={{marginTop: 5}}>
				<Row style={{marginBottom: 5}}>
					<Cell size={7}>
						<small>{this.props.strengthLabelPrefix} {label}</small>
					</Cell>

					<Cell size={5}>
						{this.props.rightElement}
					</Cell>
				</Row>

				<ProgressBar
					intent={intent}
					stripes={this.state.processing}
					value={this.state.processing ? undefined : this.state.strength / this.props.strengthTests.length}
				/>

				{this.state.compromised && this.props.compromisedPasswordWarning}
			</div>
		);
	}

	protected updateHashStats = () => {
		if (!this.props.password.length) {
			this.setState({
				compromised: false,
				hash: null,
				strength: 0,
			});

			return;
		}

		this.setState({
			processing: true,
		});

		this.doUpdateHashStatsDebounced();
	};

	protected doUpdateHashStatsDebounced: () => void = () => {
		throw new Error('doUpdateHashStatsDebounced invoked before being initialized!');
	};

	protected createDebouncedHashStatsUpdate = () => {
		return debounce(() => {
			this.props.onFetchHashStats(this.props.password, this.props.strengthTests, this.props.compromisedHashes)
				.then(stats => this.setState({
					...stats,
					processing: false,
				}));
		}, this.props.onFetchHashStatsDebounce);
	};
}
