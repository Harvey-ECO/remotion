import React from 'react';

// Personagens pequenos (estilo chibi) para os flashbacks da TV.
export type ChibiProps = {
	x: number;
	y: number;
	escala: number;
	cabelo: string;
	cabeloLongo: boolean;
	pele: string;
	roupa: string;
	oculos: boolean;
	barba: boolean;
	acessorio: 'nenhum' | 'estetoscopio' | 'prancheta' | 'capacete';
	bracos: number; // 0 = baixos, 1 = levantados (comemorando)
	pulo: number; // deslocamento vertical (pulando)
	joinha: boolean;
	olhosFechados: boolean;
};

const C = '#1A1410';

export const Chibi: React.FC<ChibiProps> = (p) => {
	const braco = (lado: 1 | -1) => {
		const ang = lado * (20 + p.bracos * 130);
		return (
			<g transform={`translate(${lado * 30}, 58) rotate(${-ang})`}>
				<rect x={-9} y={0} width={18} height={44} rx={9} fill={p.roupa} stroke={C} strokeWidth={2.5} />
				<circle cx={0} cy={48} r={10} fill={p.pele} stroke={C} strokeWidth={2.5} />
				{p.joinha && lado === -1 && <rect x={-4} y={30} width={8} height={18} rx={4} transform="rotate(180 0 40)" fill={p.pele} stroke={C} strokeWidth={2} />}
			</g>
		);
	};
	return (
		<g transform={`translate(${p.x}, ${p.y - p.pulo}) scale(${p.escala})`}>
			{p.cabeloLongo && <path d="M -46 -10 Q -52 60 -30 80 L 30 80 Q 52 60 46 -10 Z" fill={p.cabelo} stroke={C} strokeWidth={3} />}
			{/* corpo */}
			<path d="M -32 50 Q -36 110 -30 120 L 30 120 Q 36 110 32 50 Q 0 38 -32 50 Z" fill={p.roupa} stroke={C} strokeWidth={3} />
			<rect x={-22} y={118} width={16} height={26} rx={6} fill="#2A2A3A" stroke={C} strokeWidth={2.5} />
			<rect x={6} y={118} width={16} height={26} rx={6} fill="#2A2A3A" stroke={C} strokeWidth={2.5} />
			{braco(1)}
			{braco(-1)}
			{p.acessorio === 'estetoscopio' && <path d="M -16 52 Q -18 84 0 88 Q 18 84 16 52" stroke="#555" strokeWidth={4} fill="none" />}
			{p.acessorio === 'prancheta' && (
				<g transform="translate(26, 70) rotate(10)">
					<rect x={-14} y={-18} width={28} height={36} rx={3} fill="#C9A06A" stroke={C} strokeWidth={2.5} />
					<rect x={-10} y={-12} width={20} height={26} fill="#FFF" />
				</g>
			)}
			{/* cabeça */}
			<circle cx={0} cy={0} r={44} fill={p.pele} stroke={C} strokeWidth={3} />
			{p.olhosFechados ? (
				<g stroke={C} strokeWidth={3} fill="none" strokeLinecap="round">
					<path d="M -24 2 Q -16 -6 -8 2" />
					<path d="M 8 2 Q 16 -6 24 2" />
				</g>
			) : (
				<g>
					<ellipse cx={-16} cy={2} rx={7} ry={9} fill={C} />
					<ellipse cx={16} cy={2} rx={7} ry={9} fill={C} />
					<circle cx={-14} cy={-1} r={2.5} fill="#FFF" />
					<circle cx={18} cy={-1} r={2.5} fill="#FFF" />
				</g>
			)}
			{p.oculos && (
				<g stroke={C} strokeWidth={3} fill="none">
					<rect x={-30} y={-9} width={26} height={20} rx={6} />
					<rect x={4} y={-9} width={26} height={20} rx={6} />
					<path d="M -4 0 H 4" />
				</g>
			)}
			{p.barba && <path d="M -12 26 Q 0 36 12 26" stroke="#3B332E" strokeWidth={6} fill="none" strokeLinecap="round" />}
			<path d="M -10 22 Q 0 30 10 22" stroke={C} strokeWidth={3} fill="none" strokeLinecap="round" />
			<ellipse cx={-28} cy={16} rx={7} ry={4} fill="#F08A8A" opacity={0.5} />
			<ellipse cx={28} cy={16} rx={7} ry={4} fill="#F08A8A" opacity={0.5} />
			{/* cabelo */}
			{p.acessorio === 'capacete' ? (
				<path d="M -48 6 Q -50 -52 0 -54 Q 50 -52 48 6 L 30 6 Q 26 -18 0 -20 Q -26 -18 -30 6 Z" fill="#111" stroke={C} strokeWidth={3} />
			) : (
				<path d="M -46 -2 Q -50 -50 0 -50 Q 50 -50 46 -2 L 36 -18 L 24 -6 L 14 -24 L 0 -10 L -14 -24 L -24 -6 L -36 -18 Z" fill={p.cabelo} stroke={C} strokeWidth={3} strokeLinejoin="round" />
			)}
		</g>
	);
};

export const CHIBI_BASE: ChibiProps = {
	x: 0,
	y: 0,
	escala: 1,
	cabelo: '#2B2420',
	cabeloLongo: false,
	pele: '#E2B08A',
	roupa: '#1B2A52',
	oculos: false,
	barba: false,
	acessorio: 'nenhum',
	bracos: 0,
	pulo: 0,
	joinha: false,
	olhosFechados: false,
};
