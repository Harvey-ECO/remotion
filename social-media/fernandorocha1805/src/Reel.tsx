import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	random,
	Sequence,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {fitText} from '@remotion/layout-utils';
import {cores, FPS, montserrat, PERFIL, playfair} from './estilo';
import type {Cena, Post} from './tipos';

// Divide a frase em palavras e marca as que estão entre *asteriscos*.
const palavras = (frase: string) => {
	let dourado = false;
	return frase.split(' ').map((bruta) => {
		const abre = bruta.startsWith('*');
		const fecha = bruta.replace(/[.,!?:;]+$/, '').endsWith('*') && bruta.length > 1;
		if (abre) dourado = true;
		const item = {texto: bruta.replace(/\*/g, ''), dourado};
		if (fecha) dourado = false;
		return item;
	});
};

// Entrada palavra por palavra, de baixo para cima, com desfoque.
const Palavras: React.FC<{
	frase: string;
	inicio: number;
	ritmo: number;
	estilo: React.CSSProperties;
}> = ({frase, inicio, ritmo, estilo}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (
		<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.28em', ...estilo}}>
			{palavras(frase).map((p, i) => {
				const s = spring({frame: frame - inicio - i * ritmo, fps, config: {damping: 200}});
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							opacity: s,
							transform: `translateY(${(1 - s) * 40}px)`,
							filter: `blur(${(1 - s) * 8}px)`,
							color: p.dourado ? cores.dourado : undefined,
							textShadow: p.dourado ? '0 0 30px rgba(242,184,75,0.35)' : undefined,
						}}
					>
						{p.texto}
					</span>
				);
			})}
		</div>
	);
};

// Distribui as linhas da cena, cada uma começando depois da anterior.
const Linhas: React.FC<{linhas: string[]; tamanho: number; inicio: number}> = ({linhas, tamanho, inicio}) => {
	// Mede cada linha e reduz a letra quando alguma não cabe em 880 px, para nenhuma frase quebrar no meio.
	const tamanhoFinal = Math.min(
		tamanho,
		...linhas.map((l) => Math.floor(fitText({text: l.replace(/\*/g, ''), withinWidth: 880, fontFamily: montserrat, fontWeight: 800}).fontSize)),
	);
	let atraso = inicio;
	return (
		<>
			{linhas.map((linha, i) => {
				const comeco = atraso;
				atraso += linha.split(' ').length * 3 + 4;
				return (
					<Palavras
						key={i}
						frase={linha}
						inicio={comeco}
						ritmo={3}
						estilo={{fontFamily: montserrat, fontWeight: 800, fontSize: tamanhoFinal, lineHeight: 1.18}}
					/>
				);
			})}
		</>
	);
};

const CenaTroca: React.FC<{cena: Extract<Cena, {tipo: 'troca'}>}> = ({cena}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const entradaDe = spring({frame: frame - 14, fps, config: {damping: 200}});
	const risco = interpolate(frame, [45, 60], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const entradaPara = spring({frame: frame - 66, fps, config: {damping: 14}});
	return (
		<>
			<Linhas linhas={cena.linhas} tamanho={64} inicio={0} />
			<div style={{position: 'relative', marginTop: 40, fontFamily: playfair, fontStyle: 'italic', fontSize: 110, opacity: entradaDe * interpolate(frame, [60, 75], [1, 0.35], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
				{cena.de}
				<div style={{position: 'absolute', left: 0, top: '55%', height: 10, width: `${risco}%`, background: cores.dourado, borderRadius: 5}} />
			</div>
			<div style={{marginTop: 30, fontFamily: montserrat, fontWeight: 800, fontSize: 120, color: cores.dourado, opacity: Math.min(1, entradaPara), transform: `scale(${0.6 + entradaPara * 0.4})`}}>
				{cena.para}
			</div>
		</>
	);
};

const CenaVersiculo: React.FC<{cena: Extract<Cena, {tipo: 'versiculo'}>}> = ({cena}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const aspas = spring({frame, fps, config: {damping: 12}});
	const fimTexto = 10 + cena.texto.split(' ').length * 2;
	const ref = spring({frame: frame - fimTexto - 8, fps, config: {damping: 200}});
	return (
		<>
			<div style={{fontFamily: playfair, fontSize: 260, lineHeight: 0.6, color: cores.dourado, transform: `scale(${aspas})`, marginBottom: 20}}>“</div>
			<Palavras frase={cena.texto} inicio={10} ritmo={2} estilo={{fontFamily: playfair, fontStyle: 'italic', fontWeight: 500, fontSize: 76, lineHeight: 1.3}} />
			<div style={{marginTop: 50, fontFamily: montserrat, fontWeight: 600, fontSize: 40, letterSpacing: 4, color: cores.dourado, opacity: ref, transform: `translateY(${(1 - ref) * 20}px)`}}>
				{cena.referencia.toUpperCase()}
			</div>
		</>
	);
};

const CenaCta: React.FC<{cena: Extract<Cena, {tipo: 'cta'}>}> = ({cena}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const icone = spring({frame: frame - 4, fps, config: {damping: 10}});
	const pulso = 1 + Math.sin(frame / 6) * 0.04;
	const apoio = spring({frame: frame - 30, fps, config: {damping: 200}});
	return (
		<>
			<svg width="150" height="150" viewBox="0 0 100 100" style={{transform: `scale(${icone * pulso})`, marginBottom: 50}}>
				<path d="M28 14 H72 V88 L50 70 L28 88 Z" fill="none" stroke={cores.dourado} strokeWidth="7" strokeLinejoin="round" />
			</svg>
			<Linhas linhas={cena.linhas} tamanho={84} inicio={8} />
			<div style={{marginTop: 40, fontFamily: montserrat, fontWeight: 600, fontSize: 48, opacity: apoio, color: cores.dourado}}>{cena.apoio}</div>
		</>
	);
};

const ConteudoCena: React.FC<{cena: Cena}> = ({cena}) => {
	const frame = useCurrentFrame();
	const total = cena.segundos * FPS;
	const saida = interpolate(frame, [total - 9, total], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '0 90px', textAlign: 'center', color: cores.branco, opacity: saida, transform: `translateY(${(1 - saida) * -30}px)`}}>
			{cena.tipo === 'texto' && <Linhas linhas={cena.linhas} tamanho={cena.destaque ? 104 : 82} inicio={0} />}
			{cena.tipo === 'troca' && <CenaTroca cena={cena} />}
			{cena.tipo === 'versiculo' && <CenaVersiculo cena={cena} />}
			{cena.tipo === 'cta' && <CenaCta cena={cena} />}
		</AbsoluteFill>
	);
};

// Fundo azul-marinho com partículas douradas e um anel girando devagar.
const Fundo: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	return (
		<AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, ${cores.marinhoClaro} 0%, ${cores.marinho} 65%)`}}>
			<svg width={width} height={height} style={{position: 'absolute'}}>
				<circle cx={width / 2} cy={height * 0.45} r={470} fill="none" stroke={cores.dourado} strokeOpacity={0.12} strokeWidth={3} strokeDasharray="6 22" transform={`rotate(${frame * 0.15} ${width / 2} ${height * 0.45})`} />
				{new Array(40).fill(0).map((_, i) => {
					const x = random(`x${i}`) * width;
					const y = (random(`y${i}`) * height - frame * (0.4 + random(`v${i}`) * 0.8) + height * 2) % height;
					return <circle key={i} cx={x} cy={y} r={1.5 + random(`r${i}`) * 3} fill={cores.dourado} opacity={0.12 + random(`o${i}`) * 0.25} />;
				})}
			</svg>
		</AbsoluteFill>
	);
};

export const Reel: React.FC<{post: Post}> = ({post}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const selo = spring({frame, fps, config: {damping: 14}});
	let inicio = 0;
	return (
		<AbsoluteFill style={{backgroundColor: cores.marinho}}>
			<Fundo />
			{post.cenas.map((cena, i) => {
				const de = inicio;
				inicio += cena.segundos * FPS;
				return (
					<Sequence key={i} from={de} durationInFrames={cena.segundos * FPS}>
						<ConteudoCena cena={cena} />
					</Sequence>
				);
			})}
			{/* Selo da série, dentro da área segura do Reels */}
			<div style={{position: 'absolute', top: 250, width: '100%', display: 'flex', justifyContent: 'center'}}>
				<div style={{background: cores.dourado, color: cores.marinho, fontFamily: montserrat, fontWeight: 800, fontSize: 34, letterSpacing: 5, padding: '14px 34px', borderRadius: 8, transform: `scale(${selo})`}}>
					{post.serie.toUpperCase()}
				</div>
			</div>
			<div style={{position: 'absolute', top: 1420, width: '100%', textAlign: 'center', fontFamily: montserrat, fontWeight: 600, fontSize: 36, color: cores.branco, opacity: 0.75}}>
				{PERFIL}
			</div>
			<div style={{position: 'absolute', top: 1480, left: 240, width: 600, height: 6, borderRadius: 3, background: 'rgba(245,241,232,0.15)'}}>
				<div style={{height: 6, borderRadius: 3, width: `${(frame / durationInFrames) * 100}%`, background: cores.dourado}} />
			</div>
		</AbsoluteFill>
	);
};
