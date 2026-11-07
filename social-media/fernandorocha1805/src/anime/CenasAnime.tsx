import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import React from 'react';
import {AbsoluteFill, Audio, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import narracao from '../narracao.json';
import {cores, cormorant, montserrat} from '../estilo';
import type {Post} from '../tipos';
import {Chibi, CHIBI_BASE} from './Chibi';
import {Personagem, POSE_NEUTRA, type Pose} from './Personagem';

const duracoes: Record<string, number> = narracao;
type Chave = Partial<Pose> & {acenar?: boolean; balancar?: boolean; fecharOlhos?: boolean};

export type ConfigAnime = {
	introducao: number; // quadros antes da fala
	final: number; // quadros depois da fala
	volumeMusica: number;
	musica: string;
	chaves: Chave[]; // pose de cada cena da fala
};

// Início (em quadros) de cada cena da fala, a partir das durações gravadas.
export const iniciosDasCenas = (post: Post, fps: number, introducao: number): number[] => {
	let acumulado = 0;
	return post.cenas.map((_, i) => {
		const inicio = introducao + Math.round(acumulado * fps);
		acumulado += duracoes[`narracao/${post.id}-cena-${i + 1}.mp3`] ?? post.cenas[i].segundos;
		return inicio;
	});
};

export const quadrosAnime = (post: Post, fps: number, config: ConfigAnime): number => {
	const total = post.cenas.reduce((s, _, i) => s + (duracoes[`narracao/${post.id}-cena-${i + 1}.mp3`] ?? post.cenas[i].segundos), 0);
	return config.introducao + Math.round(total * fps) + config.final;
};

// Piscadas em intervalos naturais (3 a 5 segundos), com duração de 6 quadros.
const piscada = (frame: number): number => {
	let t = 40;
	let i = 0;
	while (t <= frame) {
		if (frame < t + 6) return [0.5, 1, 1, 0.6, 0.2, 0][frame - t];
		t += 90 + Math.floor(random(`p${i}`) * 60);
		i++;
	}
	return 0;
};

const ultimoIndice = (inicios: number[], frame: number): number => {
	let k = -1;
	inicios.forEach((ini, i) => {
		if (frame >= ini) k = i;
	});
	return k;
};

const misturar = (a: Pose, b: Chave, t: number): Pose => {
	const num = (x: number, y: number | undefined) => (y === undefined ? x : x + (y - x) * t);
	const par = (x: [number, number], y: [number, number] | undefined): [number, number] => (y === undefined ? x : [num(x[0], y[0]), num(x[1], y[1])]);
	return {
		...a,
		sorriso: num(a.sorriso, b.sorriso),
		sobrancelha: num(a.sobrancelha, b.sobrancelha),
		olharX: num(a.olharX, b.olharX),
		olharY: num(a.olharY, b.olharY),
		cabeca: num(a.cabeca, b.cabeca),
		bracoEsq: par(a.bracoEsq, b.bracoEsq),
		bracoDir: par(a.bracoDir, b.bracoDir),
		maoEsq: b.maoEsq !== undefined && t > 0.5 ? b.maoEsq : a.maoEsq,
		maoDir: b.maoDir !== undefined && t > 0.5 ? b.maoDir : a.maoDir,
	};
};

// Pose do quadro: passa de uma cena à outra com mola, mais respiração, balanço e aceno.
const usePose = (chaves: Chave[], inicios: number[], extra: Chave | null, inicioExtra: number): Pose => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	let pose: Pose = {...POSE_NEUTRA};
	if (extra !== null) {
		pose = misturar(pose, extra, spring({frame: frame - inicioExtra, fps, config: {damping: 16}}));
	}
	let atual: Chave | null = extra;
	chaves.forEach((chave, i) => {
		if (frame >= inicios[i] - 6) {
			pose = misturar(pose, {...POSE_NEUTRA, ...chave}, spring({frame: frame - inicios[i] + 6, fps, config: {damping: 15, mass: 0.8}}));
			atual = chave;
		}
	});
	const respiro = Math.sin(frame / 22);
	pose.bracoEsq = [pose.bracoEsq[0] + respiro * 2, pose.bracoEsq[1]];
	pose.bracoDir = [pose.bracoDir[0] - respiro * 2, pose.bracoDir[1]];
	pose.cabeca += Math.sin(frame / 37) * 1.5;
	if (atual?.acenar) pose.bracoDir = [pose.bracoDir[0], pose.bracoDir[1] + Math.sin(frame / 3.2) * 22];
	if (atual?.balancar) pose.cabeca += Math.sin(frame / 4) * 5;
	pose.piscar = atual?.fecharOlhos ? 1 : piscada(frame);
	return pose;
};

// Boca acompanha o volume da gravação.
const useBoca = (arquivo: string, inicioVoz: number): number => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const audio = useAudioData(staticFile(arquivo));
	if (!audio || frame < inicioVoz) return 0;
	const nivel = (f: number) => {
		if (f < 0) return 0;
		const bandas = visualizeAudio({fps, frame: f, audioData: audio, numberOfSamples: 32});
		return bandas.slice(1, 12).reduce((s, v) => s + v, 0) / 11;
	};
	const v = (nivel(frame - inicioVoz) + nivel(frame - inicioVoz - 1)) / 2;
	return Math.min(1, Math.max(0, (v - 0.015) * 9));
};

// Caixa de diálogo de visual novel, com o texto da fala sendo digitado.
export const Dialogo: React.FC<{post: Post; inicios: number[]; fim: number}> = ({post, inicios, fim}) => {
	const frame = useCurrentFrame();
	const i = ultimoIndice(inicios, frame);
	if (i < 0 || frame > fim) return null;
	const texto = (post.cenas[i].narracao ?? '').replace(/\*/g, '');
	const dur = (inicios[i + 1] ?? fim) - inicios[i];
	const letras = Math.floor(interpolate(frame - inicios[i], [0, dur * 0.8], [0, texto.length], {extrapolateRight: 'clamp'}));
	const entrada = spring({frame: frame - inicios[0], fps: 30, config: {damping: 18}});
	return (
		<div style={{position: 'absolute', left: 50, right: 50, top: 1210, transform: `translateY(${(1 - entrada) * 60}px)`, opacity: entrada}}>
			<div style={{position: 'absolute', top: -34, left: 30, background: cores.dourado, color: cores.marinho, fontFamily: montserrat, fontWeight: 800, fontSize: 30, letterSpacing: 4, padding: '8px 26px', borderRadius: 8, border: '3px solid #0B1430'}}>FERNANDO</div>
			<div style={{background: 'rgba(11,20,48,0.92)', border: `5px solid ${cores.dourado}`, borderRadius: 18, padding: '40px 40px 34px', minHeight: 170, fontFamily: cormorant, fontWeight: 600, fontSize: 52, lineHeight: 1.2, color: cores.branco, boxShadow: '0 10px 30px rgba(0,0,0,0.5)'}}>
				{texto.slice(0, letras)}
				<span style={{opacity: Math.floor(frame / 8) % 2 ? 1 : 0, color: cores.dourado}}> ▼</span>
			</div>
		</div>
	);
};

// ---------- NATAL: escritório, árvore e a cadeira que se vira ----------

const Arvore: React.FC<{frame: number}> = ({frame}) => (
	<g transform="translate(170, 640)">
		<rect x={-26} y={470} width={52} height={70} fill="#5B3A24" stroke="#1A1410" strokeWidth={4} />
		<rect x={-70} y={530} width={140} height={60} rx={8} fill="#8B1E2D" stroke="#1A1410" strokeWidth={4} />
		{[0, 1, 2, 3].map((n) => (
			<path key={n} d={`M 0 ${n * 110 - 40} L ${130 + n * 25} ${n * 110 + 120} L ${-130 - n * 25} ${n * 110 + 120} Z`} fill={['#1F6B3A', '#1C6234', '#195A2F', '#16512A'][n]} stroke="#0E2E18" strokeWidth={4} />
		))}
		{Array.from({length: 26}).map((_, i) => {
			const nivel = Math.floor(i / 7);
			const x = (random(`ax${i}`) - 0.5) * (150 + nivel * 60);
			const y = nivel * 110 + 40 + random(`ay${i}`) * 70;
			const brilho = 0.45 + 0.55 * Math.max(0, Math.sin(frame / 7 + i * 1.7));
			const cor = ['#F2B84B', '#E84C4C', '#7FD3FF', '#FFFFFF'][i % 4];
			return <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 11 : 7} fill={cor} opacity={brilho} style={{filter: `drop-shadow(0 0 ${8 * brilho}px ${cor})`}} />;
		})}
		<path d="M 0 -98 L 12 -66 L 46 -66 L 18 -46 L 28 -12 L 0 -32 L -28 -12 L -18 -46 L -46 -66 L -12 -66 Z" fill={cores.dourado} stroke="#1A1410" strokeWidth={3} style={{filter: `drop-shadow(0 0 ${14 + Math.sin(frame / 10) * 6}px #F2B84B)`}} />
	</g>
);

const Escritorio: React.FC<{frame: number}> = ({frame}) => (
	<svg width={1080} height={1920} style={{position: 'absolute'}}>
		<defs>
			<linearGradient id="parede" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#3A2618" />
				<stop offset="1" stopColor="#24170F" />
			</linearGradient>
			<linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#0B1430" />
				<stop offset="1" stopColor="#22325E" />
			</linearGradient>
		</defs>
		<rect width={1080} height={1920} fill="url(#parede)" />
		{Array.from({length: 7}).map((_, i) => (
			<rect key={i} x={i * 160 - 20} y={0} width={6} height={1920} fill="#1C120B" opacity={0.5} />
		))}
		{/* Janela com a cidade à noite */}
		<rect x={360} y={150} width={360} height={300} rx={6} fill="url(#ceu)" stroke="#1A1410" strokeWidth={10} />
		{Array.from({length: 30}).map((_, i) => (
			<circle key={i} cx={370 + random(`ex${i}`) * 340} cy={160 + random(`ey${i}`) * 150} r={1.5 + random(`er${i}`) * 2} fill="#FFF" opacity={0.4 + 0.6 * Math.abs(Math.sin(frame / 20 + i))} />
		))}
		{[0, 1, 2, 3, 4, 5].map((i) => (
			<rect key={i} x={370 + i * 58} y={330 - (i % 3) * 40} width={46} height={120 + (i % 3) * 40} fill="#0E1838" />
		))}
		<path d="M 540 150 V 450 M 360 300 H 720" stroke="#1A1410" strokeWidth={8} />
		{/* Estante de livros */}
		<rect x={790} y={140} width={260} height={760} fill="#4A2E1C" stroke="#1A1410" strokeWidth={6} />
		{[0, 1, 2, 3].map((p) => (
			<g key={p}>
				<rect x={790} y={140 + (p + 1) * 190 - 14} width={260} height={14} fill="#2E1C10" />
				{Array.from({length: 8}).map((_, i) => (
					<rect key={i} x={806 + i * 30} y={140 + p * 190 + 50 - (i % 3) * 12} width={24} height={126 + (i % 3) * 12} fill={['#7A1F2B', '#1F3B6B', '#2E5E3A', '#B48A3C', '#4B2E5E'][(i + p) % 5]} stroke="#1A1410" strokeWidth={2} />
				))}
			</g>
		))}
		{/* Diploma */}
		<rect x={410} y={500} width={260} height={180} fill="#F5F1E8" stroke="#B48A3C" strokeWidth={12} />
		<path d="M 450 560 H 630 M 450 590 H 610 M 450 620 H 580" stroke="#8C7A5A" strokeWidth={6} />
		<circle cx={620} cy={640} r={18} fill="#B4253A" />
		<Arvore frame={frame} />
	</svg>
);

const Mesa: React.FC<{frame: number; nome: string}> = ({frame, nome}) => (
	<svg width={1080} height={1920} style={{position: 'absolute'}}>
		<rect x={0} y={1130} width={1080} height={40} fill="#6B4428" stroke="#1A1410" strokeWidth={5} />
		<rect x={30} y={1170} width={1020} height={760} fill="#4E301C" stroke="#1A1410" strokeWidth={5} />
		<rect x={90} y={1230} width={380} height={600} rx={8} fill="none" stroke="#3A2414" strokeWidth={8} />
		<rect x={610} y={1230} width={380} height={600} rx={8} fill="none" stroke="#3A2414" strokeWidth={8} />
		{/* Plaquinha, caneca com vapor e presente */}
		<rect x={370} y={1072} width={340} height={58} rx={6} fill={cores.dourado} stroke="#1A1410" strokeWidth={4} />
		<text x={540} y={1112} textAnchor="middle" fontFamily={montserrat} fontWeight={800} fontSize={26} fill="#0B1430" letterSpacing={1}>
			{nome}
		</text>
		<rect x={800} y={1050} width={70} height={80} rx={10} fill="#F5F1E8" stroke="#1A1410" strokeWidth={4} />
		<path d="M 870 1070 Q 900 1085 870 1105" stroke="#1A1410" strokeWidth={6} fill="none" />
		{[0, 1].map((i) => (
			<path key={i} d={`M ${825 + i * 22} 1040 q 10 -20 0 -40 q -10 -20 0 -40`} stroke="#FFF" strokeWidth={4} fill="none" opacity={0.25 + 0.2 * Math.sin(frame / 10 + i)} transform={`translate(0 ${-(frame % 40) * 0.3})`} />
		))}
		<rect x={150} y={1040} width={110} height={90} fill="#B4253A" stroke="#1A1410" strokeWidth={4} />
		<rect x={196} y={1040} width={18} height={90} fill={cores.dourado} />
		<path d="M 205 1040 q -30 -30 -40 0 M 205 1040 q 30 -30 40 0" stroke={cores.dourado} strokeWidth={8} fill="none" />
	</svg>
);

const Cadeira: React.FC<{frente: boolean}> = ({frente}) => (
	<g>
		<rect x={-250} y={-330} width={500} height={900} rx={120} fill="#3A1F1A" stroke="#1A1410" strokeWidth={8} />
		{!frente && (
			<g>
				<rect x={-200} y={-280} width={400} height={760} rx={90} fill="#4A2A22" />
				{[0, 1, 2].map((i) => (
					<circle key={i} cx={-100 + i * 100} cy={-150} r={12} fill="#2A1410" />
				))}
			</g>
		)}
	</g>
);

export const NatalAnime: React.FC<{post: Post; config: ConfigAnime}> = ({post, config}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const inicios = iniciosDasCenas(post, fps, config.introducao);
	const fimFala = durationInFrames - config.final;
	// Introdução: de costas olhando a árvore (0–60), cadeira gira (60–100), acena (100–introdução).
	const giro = interpolate(frame, [60, 80, 100], [1, 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const deFrente = frame >= 80;
	const pose = usePose(config.chaves, inicios, deFrente ? {sorriso: 0.9, sobrancelha: 0.6, bracoDir: [-140, -20], acenar: true} : null, 95);
	const boca = useBoca(`narracao/${post.id}-completo.mp3`, config.introducao);
	const finalPose = frame > fimFala ? {...pose, bracoDir: [-140, -20 + Math.sin(frame / 3.2) * 22] as [number, number], sorriso: 1} : pose;
	return (
		<AbsoluteFill style={{background: '#24170F'}}>
			<Escritorio frame={frame} />
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<g transform={`translate(560, 760) scale(${giro}, 1)`}>
					<Cadeira frente={deFrente} />
					{deFrente && <Personagem x={0} y={-60} escala={0.82} pose={{...finalPose, boca}} />}
					{!deFrente && <path d="M -120 -330 Q -130 -420 0 -430 Q 130 -420 120 -330 Z" fill="#2B2420" stroke="#1A1410" strokeWidth={6} />}
				</g>
			</svg>
			<Mesa frame={frame} nome="FERNANDO ROCHA" />
			<Dialogo post={post} inicios={inicios} fim={fimFala + 20} />
			<Sequence from={config.introducao}>
				<Audio src={staticFile(`narracao/${post.id}-completo.mp3`)} />
			</Sequence>
			<Audio src={staticFile(config.musica)} volume={(f) => config.volumeMusica * interpolate(f, [0, 20, durationInFrames - 60, durationInFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
			<Titulo texto="Feliz Natal" mostrar={frame > fimFala} />
		</AbsoluteFill>
	);
};

export const Titulo: React.FC<{texto: string; mostrar: boolean}> = ({texto, mostrar}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const s = mostrar ? spring({frame: frame - (durationInFrames - 100), fps: 30, config: {damping: 10}}) : 0;
	return (
		<div style={{position: 'absolute', top: 1230, width: '100%', textAlign: 'center', transform: `scale(${s})`, fontFamily: cormorant, fontWeight: 600, fontSize: 130, color: cores.dourado, textShadow: '0 0 30px rgba(242,184,75,0.6), 0 6px 0 #1A1410'}}>
			{texto}
		</div>
	);
};

// ---------- ANO NOVO: tribunal estilizado, TV com flashbacks ----------

const LinhasDeVelocidade: React.FC<{frame: number; intensidade: number}> = ({frame, intensidade}) => (
	<svg width={1080} height={1920} style={{position: 'absolute', opacity: intensidade}}>
		{Array.from({length: 48}).map((_, i) => {
			const a = (i / 48) * Math.PI * 2 + random(`l${i}`) * 0.1;
			const r1 = 380 + random(`r${i}${Math.floor(frame / 3)}`) * 120;
			return <line key={i} x1={540 + Math.cos(a) * r1} y1={820 + Math.sin(a) * r1} x2={540 + Math.cos(a) * 1500} y2={820 + Math.sin(a) * 1500} stroke="#F5F1E8" strokeWidth={4 + random(`w${i}`) * 10} opacity={0.35} />;
		})}
	</svg>
);

export const Fogos: React.FC<{frame: number; inicio: number; area: [number, number, number, number]}> = ({frame, inicio, area}) => (
	<g>
		{Array.from({length: 6}).map((_, k) => {
			const t0 = inicio + k * 14;
			const t = frame - t0;
			if (t < 0) return null;
			const ciclo = t % 60;
			const cx = area[0] + random(`fx${k}${Math.floor(t / 60)}`) * (area[2] - area[0]);
			const cy = area[1] + random(`fy${k}${Math.floor(t / 60)}`) * (area[3] - area[1]);
			const cor = ['#F2B84B', '#E84C4C', '#7FD3FF', '#9BFF8A', '#FF9BE8', '#FFFFFF'][k];
			const r = ciclo * 3.2;
			return (
				<g key={k} opacity={Math.max(0, 1 - ciclo / 50)}>
					{Array.from({length: 14}).map((_, j) => {
						const a = (j / 14) * Math.PI * 2;
						return <line key={j} x1={cx + Math.cos(a) * r * 0.5} y1={cy + Math.sin(a) * r * 0.5 + ciclo * 0.3} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r + ciclo * 0.6} stroke={cor} strokeWidth={4} strokeLinecap="round" />;
					})}
				</g>
			);
		})}
	</g>
);

// Conteúdo da TV (560 x 320) para cada cena da fala.
const TelaTV: React.FC<{cena: number; t: number; frame: number}> = ({cena, t, frame}) => {
	const fernando = {...CHIBI_BASE, oculos: true, barba: true};
	const ceu = (c1: string, c2: string) => (
		<>
			<defs>
				<linearGradient id={`g${cena}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={c1} />
					<stop offset="1" stopColor={c2} />
				</linearGradient>
			</defs>
			<rect width={560} height={320} fill={`url(#g${cena})`} />
		</>
	);
	const legenda = (txt: string) => (
		<text x={280} y={300} textAnchor="middle" fontFamily={montserrat} fontWeight={800} fontSize={24} fill="#FFF" stroke="#000" strokeWidth={5} paintOrder="stroke">
			{txt}
		</text>
	);
	if (cena === 0 || cena === 8) {
		return (
			<g>
				{ceu('#0B1430', '#2B1E5E')}
				<Fogos frame={frame} inicio={0} area={[60, 40, 500, 200]} />
				<text x={280} y={210} textAnchor="middle" fontFamily={montserrat} fontWeight={800} fontSize={110} fill={cores.dourado} stroke="#1A1410" strokeWidth={6} paintOrder="stroke" transform={`scale(${1 + Math.sin(frame / 8) * 0.03})`} style={{transformOrigin: '280px 170px'}}>
					2027
				</text>
			</g>
		);
	}
	if (cena === 1) {
		const mes = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][Math.min(11, Math.floor(t / 5))];
		return (
			<g>
				{ceu('#F5F1E8', '#D9CBB0')}
				<rect x={170} y={30} width={220} height={230} rx={14} fill="#FFF" stroke="#1A1410" strokeWidth={5} />
				<rect x={170} y={30} width={220} height={70} rx={14} fill="#B4253A" stroke="#1A1410" strokeWidth={5} />
				<text x={280} y={80} textAnchor="middle" fontFamily={montserrat} fontWeight={800} fontSize={40} fill="#FFF">2026</text>
				<text x={280} y={200} textAnchor="middle" fontFamily={montserrat} fontWeight={800} fontSize={72} fill="#1A1410">{mes}</text>
				{legenda('Um ano de transformação')}
			</g>
		);
	}
	if (cena === 2) {
		const ecg = Array.from({length: 40}).map((_, i) => {
			const x = 380 + i * 4;
			const fase = (i + frame) % 20;
			const y = 80 - (fase === 10 ? 40 : fase === 11 ? -20 : 0);
			return `${x},${y}`;
		});
		return (
			<g>
				{ceu('#DFF2F2', '#B9DADA')}
				<rect x={40} y={170} width={300} height={60} rx={10} fill="#FFF" stroke="#1A1410" strokeWidth={4} />
				<rect x={40} y={230} width={14} height={60} fill="#999" />
				<rect x={326} y={230} width={14} height={60} fill="#999" />
				<Chibi {...fernando} x={120} y={120} escala={0.9} roupa="#7FB3D5" joinha bracos={0.3} />
				<Chibi {...CHIBI_BASE} x={420} y={150} escala={0.95} cabelo="#6B4A2B" roupa="#FFFFFF" acessorio="estetoscopio" bracos={0.15} />
				<rect x={360} y={40} width={180} height={80} rx={8} fill="#0B1430" stroke="#1A1410" strokeWidth={4} />
				<polyline points={ecg.join(' ')} stroke="#4CFF7A" strokeWidth={3} fill="none" />
				{legenda('Tirei a vesícula... e tudo bem!')}
			</g>
		);
	}
	if (cena === 3) {
		const carteira = spring({frame: t - 25, fps: 30, config: {damping: 10}});
		return (
			<g>
				{ceu('#8FD3FF', '#CFEFFF')}
				<rect x={0} y={230} width={560} height={90} fill="#555" />
				{Array.from({length: 6}).map((_, i) => (
					<rect key={i} x={((i * 110 - frame * 6) % 660) + 560 - 660} y={268} width={60} height={10} fill="#F5F1E8" />
				))}
				<g transform={`translate(170, ${212 + Math.sin(frame / 2) * 2})`}>
					<circle cx={-50} cy={20} r={26} fill="#111" stroke="#333" strokeWidth={6} />
					<circle cx={60} cy={20} r={26} fill="#111" stroke="#333" strokeWidth={6} />
					<path d="M -50 20 L -10 -20 H 40 L 60 20 M -20 -20 L 0 -40 H 30" stroke="#1A1410" strokeWidth={8} fill="none" />
					<path d="M -10 -24 Q 15 -44 44 -24 L 34 -6 H -4 Z" fill={cores.dourado} stroke="#1A1410" strokeWidth={4} />
				</g>
				<Chibi {...fernando} acessorio="capacete" x={175} y={118} escala={0.75} roupa="#1B2A52" />
				<Chibi {...CHIBI_BASE} x={430} y={150} escala={0.9} cabelo="#555" roupa="#E8792B" acessorio="prancheta" />
				<g transform={`translate(430, 70) scale(${carteira})`}>
					<rect x={-70} y={-42} width={140} height={84} rx={10} fill="#E9F5E1" stroke="#1A1410" strokeWidth={4} />
					<text x={0} y={-8} textAnchor="middle" fontFamily={montserrat} fontWeight={800} fontSize={22} fill="#1F6B3A">CNH</text>
					<text x={0} y={26} textAnchor="middle" fontFamily={montserrat} fontWeight={800} fontSize={30} fill="#1A1410">CAT. A ✓</text>
				</g>
				{legenda('Carteira de moto: aprovado!')}
			</g>
		);
	}
	if (cena === 4) {
		const pulo = (k: number) => Math.abs(Math.sin(frame / 6 + k)) * 18;
		return (
			<g>
				{ceu('#FF9A5C', '#7A3FA0')}
				<Fogos frame={frame} inicio={0} area={[40, 20, 520, 120]} />
				{/* roda-gigante e palmeiras (parque genérico) */}
				<g transform={`translate(470, 130) rotate(${frame * 0.8})`}>
					<circle r={70} fill="none" stroke="#F5F1E8" strokeWidth={4} />
					{Array.from({length: 8}).map((_, i) => (
						<line key={i} x1={0} y1={0} x2={Math.cos((i * Math.PI) / 4) * 70} y2={Math.sin((i * Math.PI) / 4) * 70} stroke="#F5F1E8" strokeWidth={2} />
					))}
				</g>
				{[60, 520].map((x, i) => (
					<g key={i} transform={`translate(${x}, 300)`}>
						<rect x={-6} y={-130} width={12} height={130} fill="#6B4A2B" />
						{[0, 1, 2, 3, 4].map((j) => (
							<path key={j} d={`M 0 -130 Q ${Math.cos(j * 1.3) * 40} ${-170 + j * 6} ${Math.cos(j * 1.3) * 70} ${-120 + j * 8}`} stroke="#1F6B3A" strokeWidth={10} fill="none" />
						))}
					</g>
				))}
				<Chibi {...fernando} x={150} y={190} escala={0.75} roupa="#2E5E3A" bracos={0.9} />
				<Chibi {...CHIBI_BASE} x={250} y={192} escala={0.72} cabelo="#6B3A1E" cabeloLongo roupa="#B4253A" bracos={0.9} />
				<Chibi {...CHIBI_BASE} x={335} y={225} escala={0.5} cabelo="#3A2A1E" roupa="#F2B84B" bracos={1} pulo={pulo(0)} />
				<Chibi {...CHIBI_BASE} x={400} y={228} escala={0.46} cabelo="#3A2A1E" cabeloLongo roupa="#7FB3D5" bracos={1} pulo={pulo(1.5)} />
				{legenda('Orlando com a família!')}
			</g>
		);
	}
	if (cena === 5) {
		return (
			<g>
				{ceu('#1B2A52', '#0B1430')}
				{[0, 1, 2, 3].map((i) => (
					<rect key={i} x={200 - i * 4} y={230 - i * 38} width={160 + i * 8} height={36} rx={4} fill={['#7A1F2B', '#1F3B6B', '#2E5E3A', '#B48A3C'][i]} stroke="#1A1410" strokeWidth={3} transform={`rotate(${(i % 2 ? 2 : -2)} 280 ${248 - i * 38})`} />
				))}
				{Array.from({length: 10}).map((_, i) => (
					<path key={i} d="M 0 -10 L 3 -3 L 10 0 L 3 3 L 0 10 L -3 3 L -10 0 L -3 -3 Z" fill={cores.dourado} transform={`translate(${100 + random(`s${i}`) * 360}, ${40 + random(`t${i}`) * 120}) scale(${0.6 + Math.abs(Math.sin(frame / 6 + i))})`} />
				))}
				{legenda('Coragem e boas leituras')}
			</g>
		);
	}
	if (cena === 6) {
		return (
			<g>
				{ceu('#2B0B3A', '#0B1430')}
				<polygon points="230,320 330,320 300,150 260,150" fill="#333" />
				<g transform={`translate(280, 130) rotate(${-20 + Math.sin(frame / 5) * 4})`}>
					<path d="M -40 30 Q -70 0 -40 -30 Q -20 -10 0 -30 Q 30 -50 50 -10 Q 60 30 20 40 Q -10 60 -40 30 Z" fill="#B4253A" stroke="#1A1410" strokeWidth={4} />
					<rect x={40} y={-14} width={150} height={14} fill="#5B3A24" stroke="#1A1410" strokeWidth={3} />
					<rect x={186} y={-22} width={30} height={30} rx={4} fill="#1A1410" />
				</g>
				{Array.from({length: 4}).map((_, i) => (
					<text key={i} x={80 + i * 120} y={80 + Math.sin(frame / 5 + i) * 15} fontSize={40} fill={cores.dourado}>♪</text>
				))}
				{legenda('Muito rock e boas estradas')}
			</g>
		);
	}
	// cena 7: fé no caminho
	return (
		<g>
			{ceu('#F2B84B', '#7A3FA0')}
			{Array.from({length: 12}).map((_, i) => (
				<line key={i} x1={280} y1={230} x2={280 + Math.cos((i / 12) * Math.PI + Math.PI) * 400} y2={230 + Math.sin((i / 12) * Math.PI + Math.PI) * 400} stroke="#FFF" strokeWidth={10} opacity={0.15 + 0.1 * Math.sin(frame / 10 + i)} />
			))}
			<path d="M 0 320 Q 280 200 560 320 Z" fill="#2E5E3A" />
			<path d="M 280 300 Q 260 260 280 240" stroke="#B48A3C" strokeWidth={0} />
			<rect x={274} y={170} width={12} height={70} fill="#F5F1E8" />
			<rect x={256} y={188} width={48} height={12} fill="#F5F1E8" />
			{legenda('E fé no caminho')}
		</g>
	);
};

const TV: React.FC<{cena: number; t: number; frame: number}> = ({cena, t, frame}) => {
	const chiado = t < 6;
	return (
		<svg width={1080} height={1920} style={{position: 'absolute'}}>
			<rect x={240} y={262} width={600} height={360} rx={22} fill="#111" stroke="#1A1410" strokeWidth={8} />
			<rect x={520} y={622} width={40} height={40} fill="#222" />
			<svg x={260} y={282} width={560} height={320} viewBox="0 0 560 320">
				{cena >= 0 && <TelaTV cena={cena} t={t} frame={frame} />}
				{chiado && Array.from({length: 60}).map((_, i) => <rect key={i} x={0} y={random(`c${i}${frame}`) * 320} width={560} height={2 + random(`h${i}${frame}`) * 6} fill="#FFF" opacity={0.5} />)}
				{Array.from({length: 40}).map((_, i) => (
					<rect key={i} x={0} y={i * 8} width={560} height={2} fill="#000" opacity={0.12} />
				))}
				<circle cx={530} cy={24} r={8} fill="#E84C4C" opacity={Math.floor(frame / 15) % 2} />
				<text x={20} y={34} fontFamily={montserrat} fontWeight={800} fontSize={22} fill="#FFF" stroke="#000" strokeWidth={4} paintOrder="stroke">{cena === 0 || cena === 8 ? 'AO VIVO' : 'FLASHBACK 2026'}</text>
			</svg>
		</svg>
	);
};

const Tribunal: React.FC = () => (
	<svg width={1080} height={1920} style={{position: 'absolute'}}>
		<defs>
			<linearGradient id="madeira" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#5A3720" />
				<stop offset="1" stopColor="#3A2214" />
			</linearGradient>
		</defs>
		<rect width={1080} height={1920} fill="url(#madeira)" />
		{Array.from({length: 6}).map((_, i) => (
			<g key={i}>
				<rect x={i * 190 + 10} y={120} width={170} height={980} rx={8} fill="none" stroke="#2A170C" strokeWidth={8} />
				<rect x={i * 190 + 30} y={140} width={130} height={940} rx={6} fill="#4A2C18" opacity={0.6} />
			</g>
		))}
		<rect x={0} y={90} width={1080} height={40} fill="#2A170C" />
	</svg>
);

const Bancada: React.FC = () => (
	<svg width={1080} height={1920} style={{position: 'absolute'}}>
		<rect x={0} y={1120} width={1080} height={48} fill="#7A4E2C" stroke="#1A1410" strokeWidth={5} />
		<rect x={20} y={1168} width={1040} height={760} fill="#5A3720" stroke="#1A1410" strokeWidth={5} />
		{[0, 1, 2].map((i) => (
			<rect key={i} x={60 + i * 340} y={1220} width={280} height={600} rx={10} fill="none" stroke="#3A2214" strokeWidth={8} />
		))}
		<g transform="translate(860, 1080)">
			{[0, 1, 2].map((i) => (
				<rect key={i} x={-70} y={-i * 26} width={150} height={24} rx={3} fill={['#1F3B6B', '#7A1F2B', '#B48A3C'][i]} stroke="#1A1410" strokeWidth={3} />
			))}
		</g>
	</svg>
);

export const AnoNovoAnime: React.FC<{post: Post; config: ConfigAnime}> = ({post, config}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const inicios = iniciosDasCenas(post, fps, config.introducao);
	const fimFala = durationInFrames - config.final;
	const cena = ultimoIndice(inicios, frame);
	const cenaTV = frame > fimFala ? 8 : Math.max(0, cena);
	const tCena = frame - (cena >= 0 ? inicios[cena] : 0);
	const pose = usePose(config.chaves, inicios, {sorriso: 0.9, bracoDir: [-140, -20], acenar: true}, 10);
	const boca = useBoca(`narracao/${post.id}-completo.mp3`, config.introducao);
	const linhas = cena === 0 || cena === 4 || frame > fimFala ? interpolate(tCena, [0, 10], [0, 1], {extrapolateRight: 'clamp'}) : 0;
	return (
		<AbsoluteFill style={{background: '#3A2214'}}>
			<Tribunal />
			<LinhasDeVelocidade frame={frame} intensidade={linhas} />
			<TV cena={cenaTV} t={frame > fimFala ? frame - fimFala : tCena} frame={frame} />
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<Personagem x={540} y={780} escala={0.78} pose={{...pose, boca}} />
			</svg>
			<Bancada />
			<svg width={1080} height={1920} style={{position: 'absolute', pointerEvents: 'none'}}>
				{frame > fimFala - 10 && <Fogos frame={frame} inicio={fimFala - 10} area={[80, 120, 1000, 700]} />}
			</svg>
			<Dialogo post={post} inicios={inicios} fim={fimFala + 20} />
			<Sequence from={config.introducao}>
				<Audio src={staticFile(`narracao/${post.id}-completo.mp3`)} />
			</Sequence>
			<Audio src={staticFile(config.musica)} volume={(f) => config.volumeMusica * interpolate(f, [0, 20, durationInFrames - 60, durationInFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
			<Titulo texto="Feliz 2027!" mostrar={frame > fimFala} />
		</AbsoluteFill>
	);
};

export const CONFIG_NATAL: ConfigAnime = {
	introducao: 120,
	final: 120,
	volumeMusica: 0.3,
	musica: 'musica/natal.mp3',
	chaves: [
		{sorriso: 1, sobrancelha: 1, bracoDir: [-140, -20], maoDir: 'aberta', acenar: true},
		{sorriso: 0.7, bracoEsq: [45, 85], bracoDir: [-45, -85], maoEsq: 'aberta', maoDir: 'aberta'},
		{sorriso: 0.6, olharY: 0.7, olharX: 0.2, bracoEsq: [30, 50], bracoDir: [-30, -50]},
		{sorriso: 0.9, cabeca: -5, olharX: -0.9, olharY: -0.7, bracoDir: [6, 118], maoDir: 'aberta', bracoEsq: [10, 10]},
		{sorriso: 0.8, sobrancelha: 0.5, bracoDir: [-85, -25], maoDir: 'apontando', bracoEsq: [12, 10]},
		{sorriso: 1, sobrancelha: 1, bracoEsq: [115, 20], bracoDir: [-115, -20], maoEsq: 'aberta', maoDir: 'aberta'},
	],
};

export const CONFIG_ANO_NOVO: ConfigAnime = {
	introducao: 45,
	final: 150,
	volumeMusica: 0.3,
	musica: 'musica/ano-novo.mp3',
	chaves: [
		{bracoEsq: [150, 20], bracoDir: [-150, -20], maoEsq: 'punho', maoDir: 'punho', sorriso: 1, sobrancelha: 1},
		{bracoDir: [-155, -15], maoDir: 'apontando', bracoEsq: [12, 10], olharY: -1, olharX: 0.2, cabeca: 4, sorriso: 0.6},
		{bracoEsq: [-6, -105], maoEsq: 'aberta', bracoDir: [-12, -10], sobrancelha: -0.6, sorriso: 0.3, olharX: 0},
		{bracoDir: [-60, -95], maoDir: 'joinha', bracoEsq: [12, 10], sorriso: 1, sobrancelha: 0.8},
		{bracoEsq: [105, 30], bracoDir: [-105, -30], maoEsq: 'aberta', maoDir: 'aberta', sorriso: 1, sobrancelha: 1, olharY: -0.8},
		{bracoDir: [-135, -60], maoDir: 'punho', bracoEsq: [12, 10], sobrancelha: 0.6, sorriso: 0.8},
		{bracoDir: [-155, -10], maoDir: 'punho', bracoEsq: [25, 60], cabeca: 6, sorriso: 1, balancar: true},
		{bracoDir: [6, 118], maoDir: 'aberta', bracoEsq: [12, 10], sorriso: 0.8, olharY: -0.3, fecharOlhos: true},
		{bracoDir: [-140, -20], maoDir: 'aberta', bracoEsq: [12, 10], sorriso: 1, sobrancelha: 1, acenar: true},
	],
};
