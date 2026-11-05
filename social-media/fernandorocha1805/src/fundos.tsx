import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {cores, type Tema} from './estilo';

// Textura de ruído (papel envelhecido ou granulado de filme). A semente muda para o grão "ferver".
const Ruido: React.FC<{semente: number; opacidade: number; sepia: boolean}> = ({semente, opacidade, sepia}) => {
	const {width, height} = useVideoConfig();
	return (
		<svg width={width} height={height} style={{position: 'absolute', opacity: opacidade, mixBlendMode: 'overlay'}}>
			<filter id={`ruido-${semente}`}>
				<feTurbulence type="fractalNoise" baseFrequency={sepia ? 0.55 : 0.9} numOctaves={sepia ? 4 : 2} seed={semente} />
				<feColorMatrix type="matrix" values={sepia ? '0.6 0.5 0.2 0 0  0.5 0.4 0.15 0 0  0.3 0.25 0.1 0 0  0 0 0 1 0' : '0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0'} />
			</filter>
			<rect width={width} height={height} filter={`url(#ruido-${semente})`} />
		</svg>
	);
};

const Particulas: React.FC<{quantidade: number; velocidade: number; tamanho: number; brilho: boolean}> = ({quantidade, velocidade, tamanho, brilho}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	return (
		<svg width={width} height={height} style={{position: 'absolute'}}>
			{new Array(quantidade).fill(0).map((_, i) => {
				const x = random(`x${i}`) * width + Math.sin(frame / 40 + i) * 20;
				const y = (random(`y${i}`) * height - frame * velocidade * (0.4 + random(`v${i}`) * 0.8) + height * 4) % height;
				const r = 1.5 + random(`r${i}`) * tamanho;
				return <circle key={i} cx={x} cy={y} r={r} fill={cores.dourado} opacity={0.12 + random(`o${i}`) * 0.3} style={brilho ? {filter: `drop-shadow(0 0 ${r * 3}px ${cores.dourado})`} : undefined} />;
			})}
		</svg>
	);
};

// Livro: papel envelhecido, moldura dupla dourada e vinheta.
const FundoLivro: React.FC = () => (
	<AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, #1E2C55 0%, ${cores.marinho} 70%)`}}>
		<Ruido semente={3} opacidade={0.35} sepia />
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, transparent 45%, rgba(0,0,0,0.55) 100%)'}} />
		<div style={{position: 'absolute', inset: 50, border: `2px solid ${cores.dourado}`, opacity: 0.45}} />
		<div style={{position: 'absolute', inset: 64, border: `1px solid ${cores.dourado}`, opacity: 0.3}} />
		<Particulas quantidade={18} velocidade={0.3} tamanho={2} brilho={false} />
	</AbsoluteFill>
);

// Rock: disco de vinil girando, cordas de guitarra vibrando a cada cena e granulado de filme.
const FundoRock: React.FC<{inicios: number[]}> = ({inicios}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const ultimoInicio = Math.max(...inicios.filter((i) => i <= frame));
	const vibracao = 22 * Math.exp(-(frame - ultimoInicio) / 10);
	const piscada = random(`p${frame}`) < 0.05 ? 0.18 : 0;
	return (
		<AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #121C3A 0%, #060A17 75%)`}}>
			<svg width={width} height={height} style={{position: 'absolute'}}>
				<g transform={`rotate(${frame * 4} 1000 1720)`}>
					<circle cx={1000} cy={1720} r={560} fill="#04060C" />
					{new Array(18).fill(0).map((_, i) => (
						<circle key={i} cx={1000} cy={1720} r={200 + i * 20} fill="none" stroke="#1A2340" strokeWidth={2} />
					))}
					<circle cx={1000} cy={1720} r={170} fill={cores.dourado} />
					<rect x={990} y={1580} width={20} height={60} fill={cores.marinho} />
					<circle cx={1000} cy={1720} r={12} fill="#04060C" />
				</g>
				<path d="M 1000 1720 L 1560 1500 A 600 600 0 0 1 1560 1940 Z" fill="white" opacity={0.05} />
				{new Array(6).fill(0).map((_, i) => {
					const y = 120 + i * 18;
					const pontos = new Array(55).fill(0).map((__, k) => {
						const x = (k / 54) * width;
						const env = Math.sin((k / 54) * Math.PI);
						return `${x},${y + Math.sin(k * 0.9 + frame * 2.1 + i) * vibracao * env * (1 - i * 0.1)}`;
					});
					return <polyline key={i} points={pontos.join(' ')} fill="none" stroke={cores.dourado} strokeOpacity={0.5} strokeWidth={1 + i * 0.5} />;
				})}
			</svg>
			<Ruido semente={frame % 9} opacidade={0.5} sepia={false} />
			<AbsoluteFill style={{background: 'black', opacity: piscada}} />
		</AbsoluteFill>
	);
};

// Fé: raios de luz girando devagar a partir do alto e poeira dourada brilhante.
const FundoFe: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: `radial-gradient(circle at 50% 10%, #26386B 0%, ${cores.marinho} 60%)`, overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					left: 540 - 1400,
					top: -250 - 1400,
					width: 2800,
					height: 2800,
					background: `repeating-conic-gradient(from 0deg, rgba(242,184,75,0.13) 0deg 5deg, transparent 5deg 16deg)`,
					WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 62%)',
					transform: `rotate(${frame * 0.12}deg)`,
				}}
			/>
			<Particulas quantidade={45} velocidade={0.6} tamanho={4} brilho />
		</AbsoluteFill>
	);
};

// Moto: estrada em perspectiva com faixas passando e linhas de velocidade.
const FundoMoto: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const horizonte = 1300;
	return (
		<AbsoluteFill style={{background: `linear-gradient(180deg, #0A1430 0%, ${cores.marinho} 55%, #081022 100%)`}}>
			<svg width={width} height={height} style={{position: 'absolute'}}>
				<polygon points={`470,${horizonte} 610,${horizonte} 1250,${height} -170,${height}`} fill="#070D1F" stroke={cores.dourado} strokeOpacity={0.35} strokeWidth={3} />
				{new Array(9).fill(0).map((_, i) => {
					const z = ((i + frame * 0.09) % 9) / 9;
					const y = horizonte + (height - horizonte) * z * z;
					const h = 6 + 110 * z * z;
					const w = 4 + 22 * z;
					return <rect key={i} x={540 - w / 2} y={y} width={w} height={h} fill={cores.dourado} opacity={0.2 + z * 0.7} />;
				})}
				<defs>
					<linearGradient id="risco" x1="0" x2="1">
						<stop offset="0" stopColor={cores.dourado} stopOpacity={0} />
						<stop offset="1" stopColor={cores.dourado} stopOpacity={0.45} />
					</linearGradient>
				</defs>
				{new Array(16).fill(0).map((_, i) => {
					const comprimento = 200 + random(`c${i}`) * 400;
					const x = width + 300 - ((frame * (25 + random(`s${i}`) * 30) + random(`d${i}`) * 3000) % (width + comprimento + 600));
					return <rect key={i} x={x} y={330 + random(`y${i}`) * 900} width={comprimento} height={3} fill="url(#risco)" />;
				})}
			</svg>
		</AbsoluteFill>
	);
};

export const Fundo: React.FC<{tema: Tema; inicios: number[]}> = ({tema, inicios}) => {
	if (tema.chave === 'livro') return <FundoLivro />;
	if (tema.chave === 'rock') return <FundoRock inicios={inicios} />;
	if (tema.chave === 'moto') return <FundoMoto />;
	return <FundoFe />;
};

// Moto: velocímetro no lugar da barra de progresso; o ponteiro sobe conforme o vídeo avança.
export const Velocimetro: React.FC<{progresso: number}> = ({progresso}) => {
	const angulo = interpolate(progresso, [0, 1], [-120, 120]);
	const r = 110;
	const arco = (a: number) => {
		const rad = ((a - 90) * Math.PI) / 180;
		return `${540 + r * Math.cos(rad)},${1620 + r * Math.sin(rad)}`;
	};
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
			<path d={`M ${arco(-120)} A ${r} ${r} 0 1 1 ${arco(120)}`} fill="none" stroke="rgba(245,241,232,0.15)" strokeWidth={10} strokeLinecap="round" />
			<path d={`M ${arco(-120)} A ${r} ${r} 0 ${angulo > 60 ? 1 : 0} 1 ${arco(angulo)}`} fill="none" stroke={cores.dourado} strokeWidth={10} strokeLinecap="round" />
			{new Array(9).fill(0).map((_, i) => {
				const a = -120 + i * 30;
				const rad = ((a - 90) * Math.PI) / 180;
				return <line key={i} x1={540 + (r - 30) * Math.cos(rad)} y1={1620 + (r - 30) * Math.sin(rad)} x2={540 + (r - 18) * Math.cos(rad)} y2={1620 + (r - 18) * Math.sin(rad)} stroke={cores.branco} strokeOpacity={0.6} strokeWidth={3} />;
			})}
			<line x1={540} y1={1620} x2={540} y2={1620 - r + 25} stroke={cores.dourado} strokeWidth={6} strokeLinecap="round" transform={`rotate(${angulo} 540 1620)`} />
			<circle cx={540} cy={1620} r={12} fill={cores.dourado} />
		</svg>
	);
};
