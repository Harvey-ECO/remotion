import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {cores, cormorant, montserrat} from '../estilo';
import type {Post} from '../tipos';
import {Dialogo, Fogos, iniciosDasCenas, Titulo} from './CenasAnime';

// Ilustrações pintadas (geradas por IA) animadas com movimentos de câmera e efeitos de luz.
// Todas as imagens têm 1536 x 2752 px; os efeitos são desenhados nas coordenadas da imagem.
const LARGURA = 1536;
const ALTURA = 2752;
const BASE = 1080 / LARGURA; // escala que cobre a largura do vídeo

type Camera = {x: number; y: number; zoom: number}; // ponto focal (0 a 1) e aproximação
type Efeito = 'luzesArvore' | 'estrelasJanela' | 'abajur' | 'fogosJanela' | 'confete' | 'fogosCeu' | 'raiosSol' | 'vapor' | 'brilhoSol' | 'texto2026';
type Plano = {imagem: string; inicio: number; fim: number; de: Camera; para: Camera; efeitos: Efeito[]};

export type ConfigIlustrado = {
	introducao: number;
	final: number;
	musica: string;
	volumeMusica: number;
	titulo: string;
	// Planos por cena (índice da cena da fala; -1 = introdução; cenas.length = final).
	planos: (inicios: number[], fimFala: number, total: number) => Plano[];
};

// Enquadramento: só a área pintada (as ilustrações têm uma borda branca de papel de ~3%).
const MARGEM_X = 0.04;
const MARGEM_Y = 0.03;
const posicao = (c: Camera) => {
	const zoom = Math.max(c.zoom, 1.1);
	const escala = BASE * zoom;
	const w = LARGURA * escala;
	const h = ALTURA * escala;
	const x = Math.min(-MARGEM_X * w, Math.max(1080 - w * (1 - MARGEM_X), 540 - c.x * w));
	const y = Math.min(-MARGEM_Y * h, Math.max(1920 - h * (1 - MARGEM_Y), 960 - c.y * h));
	return {escala, x, y};
};

const Efeitos: React.FC<{lista: Efeito[]; frame: number; t: number}> = ({lista, frame, t}) => (
	<svg width={LARGURA} height={ALTURA} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
		{lista.includes('luzesArvore') &&
			Array.from({length: 46}).map((_, i) => {
				const yy = 0.08 + random(`ly${i}`) * 0.55;
				const largura = 0.05 + (yy - 0.08) * 0.42;
				const xx = 0.17 + (random(`lx${i}`) - 0.5) * 2 * largura;
				const b = Math.max(0, Math.sin(frame / 6 + i * 2.1));
				return <circle key={i} cx={xx * LARGURA} cy={yy * ALTURA} r={10 + random(`lr${i}`) * 10} fill="#FFE7A8" opacity={0.15 + b * 0.55} style={{filter: 'blur(6px)'}} />;
			})}
		{lista.includes('estrelasJanela') &&
			Array.from({length: 14}).map((_, i) => (
				<circle key={i} cx={(0.66 + random(`sx${i}`) * 0.3) * LARGURA} cy={(0.06 + random(`sy${i}`) * 0.28) * ALTURA} r={4} fill="#FFF" opacity={Math.max(0, Math.sin(frame / 9 + i * 1.3))} style={{filter: 'blur(1.5px)'}} />
			))}
		{lista.includes('abajur') && <circle cx={0.93 * LARGURA} cy={0.41 * ALTURA} r={220} fill="#FFD27A" opacity={0.18 + 0.05 * Math.sin(frame / 12)} style={{filter: 'blur(60px)'}} />}
		{lista.includes('fogosJanela') && <Fogos frame={frame} inicio={0} area={[0.4 * LARGURA, 0.08 * ALTURA, 0.72 * LARGURA, 0.3 * ALTURA]} />}
		{lista.includes('fogosCeu') && <Fogos frame={frame} inicio={0} area={[0.1 * LARGURA, 0.04 * ALTURA, 0.9 * LARGURA, 0.28 * ALTURA]} />}
		{lista.includes('raiosSol') &&
			Array.from({length: 10}).map((_, i) => {
				const a = Math.PI * (0.65 + i * 0.07) + Math.sin(frame / 40) * 0.03;
				return <line key={i} x1={0.85 * LARGURA} y1={0.42 * ALTURA} x2={0.85 * LARGURA + Math.cos(a) * 2600} y2={0.42 * ALTURA + Math.sin(a) * 2600} stroke="#FFF3C4" strokeWidth={60} opacity={0.07 + 0.05 * Math.sin(frame / 15 + i)} style={{filter: 'blur(20px)'}} />;
			})}
		{lista.includes('brilhoSol') && <circle cx={0.48 * LARGURA} cy={0.08 * ALTURA} r={260} fill="#FFF6C8" opacity={0.25 + 0.08 * Math.sin(frame / 10)} style={{filter: 'blur(70px)'}} />}
		{lista.includes('vapor') &&
			[0, 1, 2].map((i) => {
				const ciclo = ((frame + i * 25) % 75) / 75;
				return <path key={i} d={`M ${0.58 * LARGURA + i * 18} ${0.735 * ALTURA - ciclo * 160} q 24 -40 0 -80 q -24 -40 0 -80`} stroke="#FFF" strokeWidth={10} fill="none" opacity={(1 - ciclo) * 0.4} style={{filter: 'blur(4px)'}} />;
			})}
		{lista.includes('texto2026') && (
			<text x={0.56 * LARGURA} y={0.24 * ALTURA} textAnchor="middle" fontFamily={cormorant} fontWeight={600} fontSize={260} fill={cores.dourado} opacity={interpolate(t, [0, 15], [0, 0.95], {extrapolateRight: 'clamp'})} style={{filter: 'drop-shadow(0 0 30px rgba(242,184,75,0.8))'}}>
				2026
			</text>
		)}
	</svg>
);

const Confete: React.FC<{frame: number}> = ({frame}) => (
	<svg width={1080} height={1920} style={{position: 'absolute'}}>
		{Array.from({length: 70}).map((_, i) => {
			const x = random(`cx${i}`) * 1080 + Math.sin(frame / 12 + i) * 30;
			const y = ((random(`cy${i}`) * 1920 + frame * (3 + random(`cv${i}`) * 4)) % 2000) - 40;
			return <rect key={i} x={x} y={y} width={14} height={8} fill={['#F2B84B', '#FFFFFF', '#E84C4C', '#7FD3FF'][i % 4]} opacity={0.85} transform={`rotate(${frame * 6 + i * 40} ${x + 7} ${y + 4})`} />;
		})}
	</svg>
);

export const Ilustrado: React.FC<{post: Post; cena: 'natal' | 'anonovo'}> = ({post, cena}) => {
	const config = cena === 'natal' ? CONFIG_NATAL_ILUSTRADO : CONFIG_ANO_NOVO_ILUSTRADO;
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const inicios = iniciosDasCenas(post, fps, config.introducao);
	const fimFala = durationInFrames - config.final;
	const planos = config.planos(inicios, fimFala, durationInFrames);
	const confete = planos.some((p) => p.efeitos.includes('confete') && frame >= p.inicio && frame < p.fim);
	return (
		<AbsoluteFill style={{background: '#0B1430', overflow: 'hidden'}}>
			{planos.map((p, i) => {
				if (frame < p.inicio - 15 || frame > p.fim + 15) return null;
				const t = frame - p.inicio;
				const prog = interpolate(frame, [p.inicio, p.fim], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)});
				const cam: Camera = {x: p.de.x + (p.para.x - p.de.x) * prog, y: p.de.y + (p.para.y - p.de.y) * prog, zoom: p.de.zoom + (p.para.zoom - p.de.zoom) * prog};
				const {escala, x, y} = posicao(cam);
				const anterior = planos[i - 1];
				const mesmaImagem = anterior !== undefined && anterior.imagem === p.imagem;
				const opacidade = mesmaImagem ? (frame >= p.inicio ? 1 : 0) : interpolate(frame, [p.inicio - 15, p.inicio], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
				return (
					<div key={i} style={{position: 'absolute', left: x, top: y, width: LARGURA, height: ALTURA, transform: `scale(${escala})`, transformOrigin: '0 0', opacity: opacidade}}>
						<Img src={staticFile(`ilustracoes/${p.imagem}.jpg`)} style={{width: LARGURA, height: ALTURA}} />
						<Efeitos lista={p.efeitos} frame={frame} t={t} />
					</div>
				);
			})}
			{confete && <Confete frame={frame} />}
			{/* Vinheta e textura suave de papel */}
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, transparent 55%, rgba(0,0,0,0.45) 100%)'}} />
			<Dialogo post={post} inicios={inicios} fim={fimFala + 20} />
			<Titulo texto={config.titulo} mostrar={frame > fimFala} />
			<Sequence from={config.introducao}>
				<Audio src={staticFile(`narracao/${post.id}-completo.mp3`)} />
			</Sequence>
			<Audio src={staticFile(config.musica)} volume={(f) => config.volumeMusica * interpolate(f, [0, 20, durationInFrames - 60, durationInFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
			<div style={{position: 'absolute', top: 250, width: '100%', display: 'flex', justifyContent: 'center', opacity: interpolate(frame, [0, 20, 90, 110], [0, 1, 1, 0], {extrapolateRight: 'clamp'})}}>
				<div style={{background: cores.dourado, color: cores.marinho, fontFamily: montserrat, fontWeight: 800, fontSize: 34, letterSpacing: 5, padding: '14px 34px', borderRadius: 8, transform: `scale(${spring({frame, fps, config: {damping: 14}})})`}}>
					{config.titulo.toUpperCase()}
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const CONFIG_NATAL_ILUSTRADO: ConfigIlustrado = {
	introducao: 120,
	final: 120,
	musica: 'musica/natal.mp3',
	volumeMusica: 0.3,
	titulo: 'Feliz Natal',
	planos: (ini, fimFala, total) => {
		const e: Efeito[] = ['luzesArvore', 'estrelasJanela', 'abajur'];
		const img = 'natal-escritorio';
		return [
			{imagem: img, inicio: 0, fim: ini[0], de: {x: 0.18, y: 0.32, zoom: 2.0}, para: {x: 0.55, y: 0.42, zoom: 1.45}, efeitos: e},
			{imagem: img, inicio: ini[0], fim: ini[2], de: {x: 0.55, y: 0.42, zoom: 1.45}, para: {x: 0.57, y: 0.38, zoom: 1.75}, efeitos: e},
			{imagem: img, inicio: ini[2], fim: ini[3], de: {x: 0.57, y: 0.38, zoom: 1.75}, para: {x: 0.5, y: 0.66, zoom: 1.6}, efeitos: e},
			{imagem: img, inicio: ini[3], fim: ini[4], de: {x: 0.5, y: 0.66, zoom: 1.6}, para: {x: 0.2, y: 0.35, zoom: 1.7}, efeitos: e},
			{imagem: img, inicio: ini[4], fim: ini[5], de: {x: 0.2, y: 0.35, zoom: 1.7}, para: {x: 0.57, y: 0.36, zoom: 1.9}, efeitos: e},
			{imagem: img, inicio: ini[5], fim: total, de: {x: 0.57, y: 0.36, zoom: 1.9}, para: {x: 0.5, y: 0.5, zoom: 1.0}, efeitos: e},
		];
	},
};

export const CONFIG_ANO_NOVO_ILUSTRADO: ConfigIlustrado = {
	introducao: 45,
	final: 150,
	musica: 'musica/ano-novo.mp3',
	volumeMusica: 0.3,
	titulo: 'Feliz 2027!',
	planos: (ini, fimFala, total) => [
		{imagem: 'anonovo-escritorio', inicio: 0, fim: ini[1], de: {x: 0.3, y: 0.45, zoom: 1.25}, para: {x: 0.28, y: 0.42, zoom: 1.45}, efeitos: ['fogosJanela', 'confete']},
		{imagem: 'anonovo-escritorio', inicio: ini[1], fim: ini[2], de: {x: 0.28, y: 0.42, zoom: 1.45}, para: {x: 0.56, y: 0.25, zoom: 1.7}, efeitos: ['fogosJanela', 'texto2026']},
		{imagem: 'anonovo-hospital', inicio: ini[2], fim: ini[3], de: {x: 0.62, y: 0.45, zoom: 1.3}, para: {x: 0.66, y: 0.42, zoom: 1.45}, efeitos: ['brilhoSol']},
		{imagem: 'anonovo-moto', inicio: ini[3], fim: ini[4], de: {x: 0.5, y: 0.45, zoom: 1.15}, para: {x: 0.55, y: 0.32, zoom: 1.4}, efeitos: ['brilhoSol']},
		{imagem: 'anonovo-orlando', inicio: ini[4], fim: ini[5], de: {x: 0.5, y: 0.55, zoom: 1.1}, para: {x: 0.5, y: 0.45, zoom: 1.25}, efeitos: ['fogosCeu']},
		{imagem: 'anonovo-desejos', inicio: ini[5], fim: ini[6], de: {x: 0.32, y: 0.8, zoom: 1.5}, para: {x: 0.38, y: 0.76, zoom: 1.6}, efeitos: ['vapor']},
		{imagem: 'anonovo-desejos', inicio: ini[6], fim: ini[7], de: {x: 0.38, y: 0.76, zoom: 1.6}, para: {x: 0.65, y: 0.4, zoom: 1.4}, efeitos: ['vapor']},
		{imagem: 'anonovo-fe', inicio: ini[7], fim: ini[8], de: {x: 0.5, y: 0.5, zoom: 1.1}, para: {x: 0.55, y: 0.45, zoom: 1.25}, efeitos: ['raiosSol']},
		{imagem: 'anonovo-escritorio', inicio: ini[8], fim: total, de: {x: 0.3, y: 0.45, zoom: 1.35}, para: {x: 0.5, y: 0.5, zoom: 1.0}, efeitos: ['fogosJanela', 'confete']},
	],
};
