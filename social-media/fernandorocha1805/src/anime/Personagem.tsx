import React from 'react';

// Personagem do Fernando em estilo anime (vetorial, desenhado em partes para ser animado).
// Coordenadas locais: centro da cabeça em (0, 0). O corpo desce até y ≈ 820.

export type Pose = {
	piscar: number; // 0 = olho aberto, 1 = fechado
	boca: number; // 0 = fechada, 1 = bem aberta
	sorriso: number; // 0 = neutro, 1 = sorriso largo
	sobrancelha: number; // -1 = franzida, 0 = normal, 1 = levantada
	olharX: number; // -1 a 1
	olharY: number; // -1 a 1
	cabeca: number; // inclinação da cabeça em graus
	// Braços: ângulo do ombro e do cotovelo, em graus (0 = braço para baixo).
	bracoEsq: [number, number];
	bracoDir: [number, number];
	maoEsq: 'aberta' | 'apontando' | 'joinha' | 'punho';
	maoDir: 'aberta' | 'apontando' | 'joinha' | 'punho';
};

export const POSE_NEUTRA: Pose = {
	piscar: 0,
	boca: 0,
	sorriso: 0.4,
	sobrancelha: 0,
	olharX: 0,
	olharY: 0,
	cabeca: 0,
	bracoEsq: [12, 10],
	bracoDir: [-12, -10],
	maoEsq: 'aberta',
	maoDir: 'aberta',
};

const PELE = '#E2B08A';
const PELE_SOMBRA = '#C98F69';
const CABELO = '#2B2420';
const BARBA = '#3B332E';
const BARBA_GRISALHA = '#8C8580';
const PALETO = '#1B2A52';
const PALETO_SOMBRA = '#121D3B';
const DOURADO = '#F2B84B';
const CONTORNO = '#1A1410';

const Mao: React.FC<{tipo: Pose['maoEsq']; espelhar: boolean}> = ({tipo, espelhar}) => (
	<g transform={espelhar ? 'scale(-1,1)' : undefined}>
		{tipo === 'aberta' && (
			<g>
				<ellipse cx={0} cy={0} rx={34} ry={38} fill={PELE} stroke={CONTORNO} strokeWidth={4} />
				{[-20, -7, 6, 19].map((x, i) => (
					<rect key={i} x={x - 6} y={18} width={12} height={34 - Math.abs(i - 1.5) * 4} rx={6} fill={PELE} stroke={CONTORNO} strokeWidth={3.5} />
				))}
				<rect x={24} y={-8} width={12} height={30} rx={6} transform="rotate(-35 30 6)" fill={PELE} stroke={CONTORNO} strokeWidth={3.5} />
			</g>
		)}
		{tipo === 'punho' && <rect x={-32} y={-30} width={64} height={62} rx={22} fill={PELE} stroke={CONTORNO} strokeWidth={4} />}
		{tipo === 'apontando' && (
			<g>
				<rect x={-30} y={-28} width={60} height={56} rx={20} fill={PELE} stroke={CONTORNO} strokeWidth={4} />
				<rect x={-7} y={20} width={14} height={62} rx={7} fill={PELE} stroke={CONTORNO} strokeWidth={4} />
			</g>
		)}
		{tipo === 'joinha' && (
			<g>
				<rect x={-30} y={-28} width={60} height={56} rx={20} fill={PELE} stroke={CONTORNO} strokeWidth={4} />
				<rect x={-38} y={-62} width={16} height={48} rx={8} fill={PELE} stroke={CONTORNO} strokeWidth={4} />
			</g>
		)}
	</g>
);

// Braço articulado: ombro na origem, gira o ombro, depois o cotovelo.
const Braco: React.FC<{angulos: [number, number]; mao: Pose['maoEsq']; lado: 1 | -1}> = ({angulos, mao, lado}) => (
	<g transform={`rotate(${angulos[0]})`}>
		<rect x={-40} y={-10} width={80} height={230} rx={40} fill={PALETO} stroke={CONTORNO} strokeWidth={5} />
		<g transform={`translate(0, 205) rotate(${angulos[1]})`}>
			<rect x={-36} y={-10} width={72} height={200} rx={36} fill={PALETO} stroke={CONTORNO} strokeWidth={5} />
			<rect x={-34} y={168} width={68} height={22} rx={8} fill="#F5F1E8" stroke={CONTORNO} strokeWidth={3} />
			<g transform="translate(0, 222)">
				<Mao tipo={mao} espelhar={lado === -1} />
			</g>
		</g>
	</g>
);

export const Personagem: React.FC<{pose: Pose; x: number; y: number; escala: number}> = ({pose, x, y, escala}) => {
	const abertura = 1 - pose.piscar;
	const sob = pose.sobrancelha * 10;
	return (
		<g transform={`translate(${x}, ${y}) scale(${escala})`}>
			{/* Corpo */}
			<g>
				<rect x={-45} y={150} width={90} height={90} fill={PELE_SOMBRA} stroke={CONTORNO} strokeWidth={5} />
				<path d="M -270 470 Q -262 268 -128 232 L 128 232 Q 262 268 270 470 L 285 860 L -285 860 Z" fill={PALETO} stroke={CONTORNO} strokeWidth={6} />
				<path d="M -70 232 L 70 232 L 0 430 Z" fill="#F5F1E8" stroke={CONTORNO} strokeWidth={4} />
				<path d="M -18 240 L 18 240 L 12 262 L 26 410 L 0 440 L -26 410 L -12 262 Z" fill={DOURADO} stroke={CONTORNO} strokeWidth={4} />
				<path d="M -128 232 L -70 232 L 0 430 L -40 520 L -110 330 Z" fill={PALETO_SOMBRA} stroke={CONTORNO} strokeWidth={4} />
				<path d="M 128 232 L 70 232 L 0 430 L 40 520 L 110 330 Z" fill={PALETO_SOMBRA} stroke={CONTORNO} strokeWidth={4} />
				{/* Broche dourado de balança */}
				<g transform="translate(-150, 360)">
					<circle r={20} fill={DOURADO} stroke={CONTORNO} strokeWidth={3} />
					<path d="M -10 -6 H 10 M 0 -10 V 9 M -10 -6 L -13 3 H -7 Z M 10 -6 L 7 3 H 13 Z" stroke={CONTORNO} strokeWidth={2.5} fill="none" />
				</g>
			</g>
			{/* Braços (ombros nos cantos do paletó) */}
			<g transform="translate(-235, 300)">
				<Braco angulos={pose.bracoEsq} mao={pose.maoEsq} lado={1} />
			</g>
			<g transform="translate(235, 300)">
				<Braco angulos={pose.bracoDir} mao={pose.maoDir} lado={-1} />
			</g>
			{/* Cabeça */}
			<g transform={`rotate(${pose.cabeca}, 0, 150)`}>
				<ellipse cx={-152} cy={15} rx={24} ry={40} fill={PELE} stroke={CONTORNO} strokeWidth={5} />
				<ellipse cx={152} cy={15} rx={24} ry={40} fill={PELE} stroke={CONTORNO} strokeWidth={5} />
				<path d="M -150 -60 Q -158 92 -72 168 Q 0 208 72 168 Q 158 92 150 -60 Q 140 -192 0 -202 Q -140 -192 -150 -60 Z" fill={PELE} stroke={CONTORNO} strokeWidth={6} />
				{/* Barba por fazer, cavanhaque e bigode */}
				<path d="M -120 70 Q -100 150 -40 178 Q 0 192 40 178 Q 100 150 120 70 Q 110 140 40 165 Q 0 175 -40 165 Q -110 140 -120 70 Z" fill={BARBA} opacity={0.18} />
				<path d="M -58 86 Q -30 70 0 78 Q 30 70 58 86 Q 32 96 0 90 Q -32 96 -58 86 Z" fill={BARBA} stroke={CONTORNO} strokeWidth={3} />
				<path d="M -34 138 Q 0 186 34 138 Q 18 158 0 160 Q -18 158 -34 138 Z" fill={BARBA} stroke={CONTORNO} strokeWidth={3} />
				<path d="M -20 150 Q 0 170 20 150" stroke={BARBA_GRISALHA} strokeWidth={3} fill="none" />
				{/* Boca: fechada (sorriso) ou aberta (falando) */}
				{pose.boca < 0.08 ? (
					<path d={`M -34 108 Q 0 ${112 + pose.sorriso * 16} 34 108`} stroke={CONTORNO} strokeWidth={5} fill="none" strokeLinecap="round" />
				) : (
					<g>
						<ellipse cx={0} cy={114 + pose.boca * 6} rx={26 + pose.sorriso * 6} ry={4 + pose.boca * 20} fill="#5E1A1A" stroke={CONTORNO} strokeWidth={4} />
						<ellipse cx={0} cy={124 + pose.boca * 12} rx={14} ry={3 + pose.boca * 7} fill="#C2555B" />
						<rect x={-18} y={108} width={36} height={6} rx={2} fill="#FFF" opacity={pose.boca > 0.3 ? 1 : 0} />
					</g>
				)}
				{/* Nariz */}
				<path d="M 4 4 Q -8 42 8 50" stroke={PELE_SOMBRA} strokeWidth={5} fill="none" strokeLinecap="round" />
				{/* Olhos */}
				{[-1, 1].map((lado) => (
					<g key={lado} transform={`translate(${lado * 62}, -6)`}>
						<ellipse cx={0} cy={0} rx={36} ry={Math.max(1.5, 26 * abertura)} fill="#FFF" stroke={CONTORNO} strokeWidth={4} />
						{abertura > 0.25 && (
							<g transform={`translate(${pose.olharX * 10}, ${pose.olharY * 6})`}>
								<circle r={18 * Math.min(1, abertura * 1.3)} fill="#5A3A22" />
								<circle r={9 * Math.min(1, abertura * 1.3)} fill="#120C08" />
								<circle cx={6} cy={-7} r={5} fill="#FFF" />
								<circle cx={-6} cy={6} r={2.5} fill="#FFF" opacity={0.8} />
							</g>
						)}
						<path d={`M -40 ${-26 * abertura} Q 0 ${-36 * abertura - 4} 40 ${-26 * abertura}`} stroke={CONTORNO} strokeWidth={7} fill="none" strokeLinecap="round" />
					</g>
				))}
				{/* Sobrancelhas */}
				<path d={`M -104 ${-56 - sob} Q -64 ${-74 - sob * 1.3} -26 ${-60 - sob + (pose.sobrancelha < 0 ? 8 : 0)}`} stroke={CABELO} strokeWidth={14} fill="none" strokeLinecap="round" />
				<path d={`M 104 ${-56 - sob} Q 64 ${-74 - sob * 1.3} 26 ${-60 - sob + (pose.sobrancelha < 0 ? 8 : 0)}`} stroke={CABELO} strokeWidth={14} fill="none" strokeLinecap="round" />
				{/* Óculos */}
				{[-1, 1].map((lado) => (
					<rect key={lado} x={lado * 62 - 52} y={-46} width={104} height={80} rx={20} fill="#BFE3FF" fillOpacity={0.12} stroke="#14100D" strokeWidth={8} />
				))}
				<path d="M -10 -14 Q 0 -22 10 -14" stroke="#14100D" strokeWidth={7} fill="none" />
				<path d="M -114 -14 L -150 -6 M 114 -14 L 150 -6" stroke="#14100D" strokeWidth={7} />
				{/* Cabelo com franja em mechas e têmporas grisalhas */}
				<path d="M -168 -30 Q -182 -205 -40 -238 Q 70 -262 148 -205 Q 192 -150 168 -30 L 152 -80 Q 142 -150 96 -168 L 104 -118 L 58 -160 L 46 -108 L 2 -166 L -22 -112 L -64 -168 L -88 -110 L -118 -158 Q -148 -120 -152 -78 Z" fill={CABELO} stroke={CONTORNO} strokeWidth={6} strokeLinejoin="round" />
				<path d="M -160 -60 Q -164 -20 -154 10 M -150 -70 Q -152 -30 -146 0" stroke={BARBA_GRISALHA} strokeWidth={4} fill="none" />
				<path d="M 160 -60 Q 164 -20 154 10 M 150 -70 Q 152 -30 146 0" stroke={BARBA_GRISALHA} strokeWidth={4} fill="none" />
				<path d="M -60 -220 Q 0 -238 60 -222" stroke="#5A4A40" strokeWidth={6} fill="none" opacity={0.6} />
			</g>
		</g>
	);
};
