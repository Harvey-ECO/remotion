import {FPS} from './estilo';
import narracao from './narracao.json';
import type {Post} from './tipos';

const duracoes: Record<string, number> = narracao;

// A fala começa 6 quadros depois do início da cena.
export const ATRASO_FALA = 6;
const PAUSA_DEPOIS_DA_FALA = 0.35; // segundos

// Arquivo de narração da cena, quando o áudio já existe (voz sintetizada ou gravada pelo Fernando).
export const arquivoNarracao = (post: Post, indice: number): string | null => {
	const arquivo = `narracao/${post.id}-cena-${indice + 1}.mp3`;
	return arquivo in duracoes ? arquivo : null;
};

// A cena dura o tempo do roteiro ou o tempo da fala mais uma pausa, o que for maior.
export const quadrosDaCena = (post: Post, indice: number): number => {
	const roteiro = Math.round(post.cenas[indice].segundos * FPS);
	const arquivo = arquivoNarracao(post, indice);
	if (arquivo === null) return roteiro;
	return Math.max(roteiro, ATRASO_FALA + Math.ceil((duracoes[arquivo] + PAUSA_DEPOIS_DA_FALA) * FPS));
};

export const quadrosDoPost = (post: Post): number => post.cenas.reduce((soma, _, i) => soma + quadrosDaCena(post, i), 0);
