import React, {useContext, useMemo, useState} from 'react';
import type {AnyComposition} from 'remotion';
import {Internals} from 'remotion';
import {RenderModalData} from './RenderModal/RenderModalData';

const container: React.CSSProperties = {
	height: '100%',
	width: '100%',
	position: 'absolute',
	overflow: 'auto',
};

const PropsEditor: React.FC<{
	composition: AnyComposition;
}> = ({composition}) => {
	const [inputProps, setInputProps] = useState(() => composition.defaultProps);

	return (
		<div>
			<RenderModalData
				composition={composition}
				inputProps={inputProps}
				setInputProps={setInputProps}
				compact
			/>
		</div>
	);
};

export const RightPanel: React.FC<{}> = () => {
	const {compositions, currentComposition} = useContext(
		Internals.CompositionManager
	);

	const composition = useMemo((): AnyComposition | null => {
		for (const comp of compositions) {
			if (comp.id === currentComposition) {
				return comp;
			}
		}

		return null;
	}, [compositions, currentComposition]);

	if (composition === null) {
		return null;
	}

	return (
		<div style={container}>
			<PropsEditor composition={composition} />
		</div>
	);
};
