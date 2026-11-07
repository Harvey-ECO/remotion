import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Personagem, POSE_NEUTRA} from './Personagem';

export const AnimeTeste: React.FC = () => (
	<AbsoluteFill style={{background: '#22325E'}}>
		<svg width={1080} height={1920}>
			<Personagem x={270} y={520} escala={0.62} pose={POSE_NEUTRA} />
			<Personagem x={810} y={520} escala={0.62} pose={{...POSE_NEUTRA, boca: 0.8, sorriso: 0.8, sobrancelha: 1, bracoDir: [-120, -40], maoDir: 'apontando', bracoEsq: [30, 60], maoEsq: 'joinha'}} />
			<Personagem x={270} y={1250} escala={0.62} pose={{...POSE_NEUTRA, piscar: 1, sorriso: 1, cabeca: -6}} />
			<Personagem x={810} y={1250} escala={0.62} pose={{...POSE_NEUTRA, boca: 0.4, olharX: 1, sobrancelha: -1, bracoEsq: [150, 30], bracoDir: [-150, -30]}} />
		</svg>
	</AbsoluteFill>
);
