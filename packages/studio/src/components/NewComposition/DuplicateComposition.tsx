import type {ChangeEventHandler} from 'react';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {
	validateCompositionDimension,
	validateCompositionName,
} from '../../helpers/validate-new-comp-data';
import {Checkmark} from '../../icons/Checkmark';
import {
	loadAspectRatioOption,
	persistAspectRatioOption,
} from '../../state/aspect-ratio-locked';
import {ModalsContext} from '../../state/modals';
import {Row, Spacing} from '../layout';
import {getMaxModalWidth, ModalContainer} from '../ModalContainer';
import {NewCompHeader} from '../ModalHeader';
import {
	ResolveCompositionBeforeModal,
	ResolvedCompositionContext,
} from '../RenderModal/ResolveCompositionBeforeModal';
import type {ComboboxValue} from './ComboBox';
import {Combobox} from './ComboBox';
import {InputDragger} from './InputDragger';
import {inputArea, leftLabel} from './new-comp-layout';
import {NewCompAspectRatio} from './NewCompAspectRatio';
import {NewCompDuration} from './NewCompDuration';
import {RemotionInput} from './RemInput';
import {ValidationMessage} from './ValidationMessage';

const left: React.CSSProperties = {
	padding: 12,
	paddingBottom: 80,
	paddingRight: 12,
	flex: 1,
	fontSize: 13,
};

const comboBoxStyle: React.CSSProperties = {
	width: inputArea.width,
};

const commonFrameRates = [24, 25, 29.97, 30, 48, 50];

type CompType = 'composition' | 'still';

const DuplicateCompositionLoaded: React.FC<{
	compositionId: string;
}> = () => {
	const context = useContext(ResolvedCompositionContext);
	if (!context) {
		throw new Error('Resolved composition context');
	}

	const {resolved} = context;

	const initialCompType: CompType =
		context.resolved.result.durationInFrames === 1 ? 'still' : 'composition';
	const [selectedFrameRate, setFrameRate] = useState<string>(
		String(commonFrameRates[0]),
	);
	const {compositions} = useContext(Internals.CompositionManager);
	const [type, setType] = useState<CompType>(initialCompType);
	const [name, setName] = useState(() => resolved.result.id);
	const [size, setSize] = useState(() => ({
		width: String(resolved.result.width),
		height: String(resolved.result.height),
	}));

	const panelContent: React.CSSProperties = useMemo(() => {
		return {
			flexDirection: 'row',
			display: 'flex',
			width: getMaxModalWidth(600),
			overflow: 'hidden',
		};
	}, []);

	const [lockedAspectRatio, setLockedAspectRatio] = useState(
		loadAspectRatioOption() ? Number(size.width) / Number(size.height) : null,
	);
	const [durationInFrames, setDurationInFrames] = useState('150');

	const setAspectRatioLocked = useCallback(
		(option: boolean) => {
			persistAspectRatioOption(option);
			setLockedAspectRatio(
				option ? Number(size.width) / Number(size.height) : null,
			);
		},
		[size.height, size.width],
	);

	const {setSelectedModal} = useContext(ModalsContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	const onTypeChanged = useCallback((newType: CompType) => {
		setType(newType);
	}, []);

	const onWidthChanged = useCallback(
		(newValue: string) => {
			setSize((s) => {
				const {height} = s;
				const newWidth = Number(newValue);
				return {
					height:
						lockedAspectRatio === null
							? height
							: String(Math.ceil(newWidth / lockedAspectRatio / 2) * 2),
					width: String(newWidth),
				};
			});
		},
		[lockedAspectRatio],
	);

	const onWidthDirectlyChanged = useCallback(
		(newWidth: number) => {
			setSize((s) => {
				const {height} = s;

				return {
					height:
						lockedAspectRatio === null
							? height
							: String(Math.ceil(newWidth / lockedAspectRatio / 2) * 2),
					width: String(newWidth),
				};
			});
		},
		[lockedAspectRatio],
	);

	const onHeightDirectlyChanged = useCallback(
		(newHeight: number) => {
			setSize((s) => {
				const {width} = s;

				return {
					width:
						lockedAspectRatio === null
							? width
							: String(Math.ceil((newHeight / 2) * lockedAspectRatio) * 2),
					height: String(newHeight),
				};
			});
		},
		[lockedAspectRatio],
	);

	const onHeightChanged = useCallback(
		(newValue: string) => {
			setSize((s) => {
				const {width} = s;
				const newHeight = Number(newValue);
				return {
					width:
						lockedAspectRatio === null
							? width
							: String(Math.ceil((newHeight / 2) * lockedAspectRatio) * 2),
					height: String(newHeight),
				};
			});
		},
		[lockedAspectRatio],
	);
	const onNameChange: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setName(e.target.value);
		},
		[],
	);
	const onFpsChange = useCallback((newFps: number) => {
		setFrameRate(String(newFps));
	}, []);

	const items: ComboboxValue[] = useMemo(() => {
		return commonFrameRates.map((frameRate): ComboboxValue => {
			return {
				id: String(frameRate),
				label: `${frameRate}fps`,
				onClick: () => onFpsChange(frameRate),
				type: 'item',
				value: frameRate,
				keyHint: null,
				leftItem:
					String(frameRate) === selectedFrameRate ? <Checkmark /> : null,
				subMenu: null,
				quickSwitcherLabel: null,
			};
		});
	}, [onFpsChange, selectedFrameRate]);

	const compNameErrMessage = validateCompositionName(name, compositions);
	const compWidthErrMessage = validateCompositionDimension('Width', size.width);
	const compHeightErrMessage = validateCompositionDimension(
		'Height',
		size.height,
	);

	const typeValues: ComboboxValue[] = useMemo(() => {
		return [
			{
				id: 'composition',
				keyHint: null,
				label: '<Composition />',
				leftItem: null,
				onClick: () => onTypeChanged('composition'),
				subMenu: null,
				type: 'item',
				value: 'composition' as CompType,
				quickSwitcherLabel: null,
			},
			{
				id: 'still',
				keyHint: null,
				label: '<Still />',
				leftItem: null,
				onClick: () => onTypeChanged('still'),
				subMenu: null,
				type: 'item',
				value: 'still' as CompType,
				quickSwitcherLabel: null,
			},
		];
	}, [onTypeChanged]);

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<NewCompHeader title="Duplicate composition" />
			<div style={panelContent}>
				<div style={left}>
					<Spacing y={3} />
					<form>
						<label>
							<Row align="center">
								<div style={leftLabel}>Type</div>
								<div style={inputArea}>
									<Combobox
										title="Type of composition"
										style={comboBoxStyle}
										values={typeValues}
										selectedId={type}
									/>
								</div>
							</Row>
							<Spacing y={1} />
							<Row align="center">
								<div style={leftLabel}>Name</div>
								<div style={inputArea}>
									<RemotionInput
										value={name}
										onChange={onNameChange}
										type="text"
										placeholder="Composition name"
										status="ok"
										rightAlign={false}
									/>
									{compNameErrMessage ? (
										<>
											<Spacing y={1} block />
											<ValidationMessage
												align="flex-start"
												message={compNameErrMessage}
												type="error"
											/>
										</>
									) : null}
								</div>
							</Row>
						</label>
						<Spacing y={1} />
						<Row align="center">
							<div>
								<div>
									<label>
										<Row align="center">
											<div style={leftLabel}>Width</div>
											<div style={inputArea}>
												<InputDragger
													type="number"
													value={size.width}
													placeholder="Width"
													onTextChange={onWidthChanged}
													name="width"
													step={2}
													min={2}
													required
													status="ok"
													formatter={(w) => `${w}px`}
													max={100000000}
													onValueChange={onWidthDirectlyChanged}
													rightAlign={false}
												/>
												{compWidthErrMessage ? (
													<>
														<Spacing y={1} block />
														<ValidationMessage
															align="flex-start"
															message={compWidthErrMessage}
															type="error"
														/>
													</>
												) : null}
											</div>
										</Row>
									</label>
								</div>
								<div />
								<Spacing y={1} />
								<div />
								<label>
									<Row align="center">
										<div style={leftLabel}>Height</div>
										<div style={inputArea}>
											<InputDragger
												type="number"
												value={size.height}
												onTextChange={onHeightChanged}
												placeholder="Height"
												name="height"
												step={2}
												required
												formatter={(h) => `${h}px`}
												min={2}
												status="ok"
												max={100000000}
												onValueChange={onHeightDirectlyChanged}
												rightAlign={false}
											/>
											{compHeightErrMessage ? (
												<>
													<Spacing y={1} block />
													<ValidationMessage
														align="flex-start"
														message={compHeightErrMessage}
														type="error"
													/>
												</>
											) : null}
										</div>
									</Row>
								</label>
							</div>
							<div>
								<NewCompAspectRatio
									width={Number(size.width)}
									height={Number(size.height)}
									aspectRatioLocked={lockedAspectRatio}
									setAspectRatioLocked={setAspectRatioLocked}
								/>
							</div>
						</Row>
						<div />
						<Spacing y={1} />
						{type === 'composition' ? (
							<NewCompDuration
								durationInFrames={durationInFrames}
								fps={selectedFrameRate}
								setDurationInFrames={setDurationInFrames}
							/>
						) : null}
						<div />
						<br />
						<div />
						{type === 'composition' ? (
							<div>
								<div />
								<Spacing y={1} />
								<label>
									<div style={leftLabel}>Framerate</div>
									<Combobox
										title="Framerate"
										style={comboBoxStyle}
										values={items}
										selectedId={selectedFrameRate}
									/>
								</label>
							</div>
						) : null}
					</form>
				</div>
			</div>
		</ModalContainer>
	);
};

export const DuplicateComposition: React.FC<{
	compositionId: string;
}> = ({compositionId}) => {
	return (
		<ResolveCompositionBeforeModal compositionId={compositionId}>
			<DuplicateCompositionLoaded compositionId={compositionId} />
		</ResolveCompositionBeforeModal>
	);
};
