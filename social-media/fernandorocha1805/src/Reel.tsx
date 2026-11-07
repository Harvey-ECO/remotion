import {fitText} from '@remotion/layout-utils';
import React from 'react';
import {
	AbsoluteFill,
	Audio,
	interpolate,
	random,
	Sequence,
	staticFile,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {cores, FPS, montserrat, PERFIL, playfair, temaDaSerie, type Tema} from './estilo';
import {ATRASO_FALA, arquivoGravacao, arquivoNarracao, INTRODUCAO_GRAVADA, quadrosDaCena} from './duracoes';
import {musicas} from './musicas';
import {Fundo, Velocimetro} from './fundos';
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

const VELOCIDADE_MAQUINA = 1.6; // letras por quadro
const ritmoDoTema = (tema: Tema) => (tema.chave === 'rock' ? 4 : tema.chave === 'fe' ? 4 : 3);

// Entrada palavra por palavra, com o movimento de cada série.
const Palavras: React.FC<{frase: string; inicio: number; tema: Tema; estilo: React.CSSProperties}> = ({frase, inicio, tema, estilo}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const ritmo = ritmoDoTema(tema);
	return (
		<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.26em', ...estilo}}>
			{palavras(frase).map((p, i) => {
				const f = frame - inicio - i * ritmo;
				let transform = '';
				let opacity = 1;
				let filter = '';
				if (tema.chave === 'rock') {
					const s = spring({frame: f, fps, config: {damping: 11, stiffness: 220, mass: 0.6}});
					transform = `scale(${2.2 - 1.2 * s})`;
					opacity = Math.min(1, s * 2.5);
				} else if (tema.chave === 'moto') {
					const s = spring({frame: f, fps, config: {damping: 200}});
					transform = `translateX(${(1 - s) * -180}px) skewX(${(1 - s) * -25}deg)`;
					opacity = s;
				} else {
					const s = spring({frame: f, fps, config: {damping: 200}, durationInFrames: tema.chave === 'fe' ? 25 : undefined});
					transform = `translateY(${(1 - s) * 40}px)`;
					opacity = s;
					filter = `blur(${(1 - s) * 8}px)`;
				}
				const desvio = tema.chave === 'rock' ? 2 + Math.sin(frame * 1.3 + i) * 2 : 0;
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							opacity,
							transform,
							filter,
							color: p.dourado ? cores.dourado : undefined,
							textShadow: p.dourado
								? tema.chave === 'rock'
									? `${-desvio}px 0 rgba(255,40,90,0.75), ${desvio}px 0 rgba(0,220,255,0.75)`
									: '0 0 30px rgba(242,184,75,0.35)'
								: undefined,
						}}
					>
						{p.texto}
					</span>
				);
			})}
		</div>
	);
};

// Livro: as linhas são datilografadas letra por letra, com cursor piscando.
const LinhasMaquina: React.FC<{linhas: string[]; inicio: number; estilo: React.CSSProperties}> = ({linhas, inicio, estilo}) => {
	const frame = useCurrentFrame();
	const digitadas = Math.max(0, (frame - inicio) * VELOCIDADE_MAQUINA);
	const cursorVisivel = Math.floor(frame / 8) % 2 === 0;
	let comecoLinha = 0;
	const totalLetras = linhas.reduce((soma, l) => soma + l.replace(/\*/g, '').length + 6, 0);
	return (
		<>
			{linhas.map((linha, li) => {
				const texto = linha.replace(/\*/g, '');
				const visiveis = Math.floor(Math.max(0, Math.min(texto.length, digitadas - comecoLinha)));
				const ehUltima = li === linhas.length - 1;
				const digitando = visiveis > 0 && (visiveis < texto.length || (ehUltima && digitadas >= totalLetras - 6));
				comecoLinha += texto.length + 6;
				let posicao = 0;
				return (
					<div key={li} style={{...estilo, whiteSpace: 'pre'}}>
						{palavras(linha).map((p, i) => {
							const pedaco = (i > 0 ? ' ' : '') + p.texto;
							const inicioPedaco = posicao;
							posicao += pedaco.length;
							const mostrar = Math.max(0, Math.min(pedaco.length, visiveis - inicioPedaco));
							const cursorAqui = digitando && mostrar > 0 && inicioPedaco + mostrar === visiveis;
							return (
								<span key={i} style={{color: p.dourado ? cores.dourado : undefined}}>
									{pedaco.slice(0, mostrar)}
									{cursorAqui ? (
										<span style={{position: 'relative'}}>
											<span style={{position: 'absolute', left: 3, top: '0.12em', width: 5, height: '0.85em', background: cores.dourado, opacity: cursorVisivel ? 1 : 0}} />
										</span>
									) : null}
									<span style={{color: 'transparent'}}>{pedaco.slice(mostrar)}</span>
								</span>
							);
						})}
					</div>
				);
			})}
		</>
	);
};

// Distribui as linhas da cena na fonte da série, medindo a largura real para nenhuma frase quebrar.
const Linhas: React.FC<{linhas: string[]; tamanho: number; inicio: number; tema: Tema}> = ({linhas, tamanho, inicio, tema}) => {
	const prepara = (l: string) => (tema.maiusculas ? l.toUpperCase() : l);
	const tamanhoFinal = Math.min(
		tamanho,
		...linhas.map((l) => Math.floor(fitText({text: prepara(l.replace(/\*/g, '')), withinWidth: 880, fontFamily: tema.fonte, fontWeight: tema.peso, letterSpacing: tema.chave === 'rock' ? '2px' : undefined}).fontSize)),
	);
	const estilo: React.CSSProperties = {
		fontFamily: tema.fonte,
		fontWeight: tema.peso,
		fontSize: tamanhoFinal,
		lineHeight: tema.chave === 'rock' ? 1.0 : 1.18,
		letterSpacing: tema.chave === 'rock' ? 2 : undefined,
	};
	if (tema.chave === 'livro') {
		return <LinhasMaquina linhas={linhas} inicio={inicio} estilo={estilo} />;
	}
	let atraso = inicio;
	return (
		<>
			{linhas.map((linha, i) => {
				const comeco = atraso;
				atraso += linha.split(' ').length * ritmoDoTema(tema) + 4;
				return <Palavras key={i} frase={prepara(linha)} inicio={comeco} tema={tema} estilo={estilo} />;
			})}
		</>
	);
};

const CenaTroca: React.FC<{cena: Extract<Cena, {tipo: 'troca'}>; tema: Tema}> = ({cena, tema}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const entradaDe = spring({frame: frame - 24, fps, config: {damping: 200}});
	const risco = interpolate(frame, [55, 70], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const entradaPara = spring({frame: frame - 76, fps, config: {damping: 14}});
	return (
		<>
			<Linhas linhas={cena.linhas} tamanho={72} inicio={0} tema={tema} />
			<div style={{position: 'relative', marginTop: 40, fontFamily: tema.fonte, fontWeight: tema.peso, fontSize: 120, opacity: entradaDe * interpolate(frame, [70, 85], [1, 0.35], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
				{cena.de}
				<div style={{position: 'absolute', left: 0, top: '52%', height: 10, width: `${risco}%`, background: cores.dourado, borderRadius: 5}} />
			</div>
			<div style={{marginTop: 20, fontFamily: tema.fonte, fontWeight: tema.peso, fontSize: 150, color: cores.dourado, opacity: Math.min(1, entradaPara), transform: `scale(${0.6 + entradaPara * 0.4})`}}>
				{cena.para}
			</div>
		</>
	);
};

const CenaVersiculo: React.FC<{cena: Extract<Cena, {tipo: 'versiculo'}>; tema: Tema}> = ({cena, tema}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const aspas = spring({frame, fps, config: {damping: 12}});
	const fimTexto = 10 + cena.texto.split(' ').length * ritmoDoTema(tema);
	const ref = spring({frame: frame - fimTexto - 8, fps, config: {damping: 200}});
	return (
		<>
			<div style={{fontFamily: playfair, fontSize: 260, lineHeight: 0.6, color: cores.dourado, transform: `scale(${aspas})`, marginBottom: 20}}>“</div>
			<Palavras frase={cena.texto} inicio={10} tema={tema} estilo={{fontFamily: playfair, fontStyle: 'italic', fontWeight: 500, fontSize: 76, lineHeight: 1.3}} />
			<div style={{marginTop: 50, fontFamily: montserrat, fontWeight: 600, fontSize: 40, letterSpacing: 4, color: cores.dourado, opacity: ref, transform: `translateY(${(1 - ref) * 20}px)`}}>
				{cena.referencia.toUpperCase()}
			</div>
		</>
	);
};

const CenaCta: React.FC<{cena: Extract<Cena, {tipo: 'cta'}>; tema: Tema}> = ({cena, tema}) => {
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
			<Linhas linhas={cena.linhas} tamanho={tema.tamanho} inicio={8} tema={tema} />
			<div style={{marginTop: 40, fontFamily: montserrat, fontWeight: 600, fontSize: 48, opacity: apoio, color: cores.dourado}}>{cena.apoio}</div>
		</>
	);
};

// Transição de saída de cada série: página virando, corte com falha, clarão de luz ou arrancada.
const saida = (tema: Tema, frame: number, total: number): React.CSSProperties => {
	const p = interpolate(frame, [total - 10, total], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	if (tema.chave === 'livro') {
		return {transform: `perspective(1800px) rotateY(${-p * 100}deg)`, transformOrigin: 'left center', opacity: 1 - p * 0.4};
	}
	if (tema.chave === 'rock') {
		const tremor = Math.floor(frame / 2);
		const dx = p > 0 ? (random(`g${frame}`) - 0.5) * 120 : (random(`j${tremor}`) - 0.5) * 6;
		const dy = p > 0 ? 0 : (random(`k${tremor}`) - 0.5) * 6;
		return {transform: `translate(${dx}px, ${dy}px)`, opacity: p >= 1 ? 0 : p > 0 && frame % 2 === 0 ? 0.25 : 1};
	}
	if (tema.chave === 'moto') {
		return {transform: `translateX(${-p * 1300}px) skewX(${-p * 12}deg)`, filter: `blur(${p * 10}px)`, opacity: 1 - p * 0.5};
	}
	const zoom = 1 + (frame / total) * 0.06;
	return {transform: `scale(${zoom})`, filter: `brightness(${1 + p * 2.5})`, opacity: 1 - p};
};

const ConteudoCena: React.FC<{cena: Cena; tema: Tema; total: number}> = ({cena, tema, total}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '0 90px', textAlign: 'center', color: cores.branco, ...saida(tema, frame, total)}}>
			{cena.tipo === 'texto' && <Linhas linhas={cena.linhas} tamanho={cena.destaque ? tema.tamanhoDestaque : tema.tamanho} inicio={0} tema={tema} />}
			{cena.tipo === 'troca' && <CenaTroca cena={cena} tema={tema} />}
			{cena.tipo === 'versiculo' && <CenaVersiculo cena={cena} tema={tema} />}
			{cena.tipo === 'cta' && <CenaCta cena={cena} tema={tema} />}
		</AbsoluteFill>
	);
};

export const Reel: React.FC<{post: Post}> = ({post}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const tema = temaDaSerie(post.serie);
	const selo = spring({frame, fps, config: {damping: 14}});
	const inicios = post.cenas.reduce<number[]>((lista, _, i) => [...lista, i === 0 ? 0 : lista[i - 1] + quadrosDaCena(post, i - 1)], []);
	const progresso = frame / durationInFrames;
	return (
		<AbsoluteFill style={{backgroundColor: cores.marinho}}>
			<Fundo tema={tema} inicios={inicios} />
			{arquivoGravacao(post) === null ? null : (
				<Sequence from={INTRODUCAO_GRAVADA}>
					<Audio src={staticFile(arquivoGravacao(post) as string)} />
				</Sequence>
			)}
			{musicas[post.id] === undefined ? null : (
				<Audio
					src={staticFile(musicas[post.id].arquivo)}
					volume={(f) =>
						musicas[post.id].volume *
						interpolate(f, [0, 15, durationInFrames - 45, durationInFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
					}
				/>
			)}
			{post.cenas.map((cena, i) => (
				<Sequence key={i} from={inicios[i]} durationInFrames={quadrosDaCena(post, i)}>
					<ConteudoCena cena={cena} tema={tema} total={quadrosDaCena(post, i)} />
					{arquivoNarracao(post, i) === null ? null : (
						<Sequence from={ATRASO_FALA}>
							<Audio src={staticFile(arquivoNarracao(post, i) as string)} />
						</Sequence>
					)}
				</Sequence>
			))}
			{/* Selo da série, dentro da área segura do Reels */}
			<div style={{position: 'absolute', top: 250, width: '100%', display: 'flex', justifyContent: 'center'}}>
				<div style={{background: cores.dourado, color: cores.marinho, fontFamily: montserrat, fontWeight: 800, fontSize: 34, letterSpacing: 5, padding: '14px 34px', borderRadius: 8, transform: `scale(${selo})`}}>
					{post.serie.toUpperCase()}
				</div>
			</div>
			<div style={{position: 'absolute', top: 1420, width: '100%', textAlign: 'center', fontFamily: montserrat, fontWeight: 600, fontSize: 36, color: cores.branco, opacity: 0.75}}>
				{PERFIL}
			</div>
			{tema.chave === 'moto' ? (
				<Velocimetro progresso={progresso} />
			) : (
				<div style={{position: 'absolute', top: 1480, left: 240, width: 600, height: 6, borderRadius: 3, background: 'rgba(245,241,232,0.15)'}}>
					<div style={{height: 6, borderRadius: 3, width: `${progresso * 100}%`, background: cores.dourado}} />
				</div>
			)}
		</AbsoluteFill>
	);
};
