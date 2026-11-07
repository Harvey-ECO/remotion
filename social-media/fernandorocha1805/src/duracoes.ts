import {FPS} from './estilo';
import narracao from './narracao.json';
import type {Post} from './tipos';

const duracoes: Record<string, number> = narracao;

// Voz sintetizada: a fala começa 6 quadros depois do início da cena.
export const ATRASO_FALA = 6;
const PAUSA_DEPOIS_DA_FALA = 0.35; // segundos

// Voz gravada (contínua): introdução só com música antes da fala e final para a música respirar.
export const INTRODUCAO_GRAVADA = 45;
const FINAL_GRAVADO = 90;

// Gravação contínua do Fernando, quando existe: um único áudio para o post inteiro.
export const arquivoGravacao = (post: Post): string | null => {
	const arquivo = `narracao/${post.id}-completo.mp3`;
	return post.voz === 'fernando' && arquivo in duracoes ? arquivo : null;
};

// Arquivo de narração da cena (voz sintetizada, um arquivo por cena).
export const arquivoNarracao = (post: Post, indice: number): string | null => {
	const arquivo = `narracao/${post.id}-cena-${indice + 1}.mp3`;
	return arquivoGravacao(post) === null && arquivo in duracoes ? arquivo : null;
};

export const quadrosDaCena = (post: Post, indice: number): number => {
	const roteiro = Math.round(post.cenas[indice].segundos * FPS);
	if (arquivoGravacao(post) !== null) {
		// Cada cena dura exatamente o trecho da gravação; os inícios são arredondados sobre o tempo acumulado
		// para a soma não se afastar da fala.
		const acumulado = (n: number) =>
			post.cenas.slice(0, n).reduce((soma, _, i) => soma + (duracoes[`narracao/${post.id}-cena-${i + 1}.mp3`] ?? 0), 0);
		const quadros = Math.round(acumulado(indice + 1) * FPS) - Math.round(acumulado(indice) * FPS);
		const extra = (indice === 0 ? INTRODUCAO_GRAVADA : 0) + (indice === post.cenas.length - 1 ? FINAL_GRAVADO : 0);
		return quadros + extra;
	}
	const arquivo = arquivoNarracao(post, indice);
	if (arquivo === null) return roteiro;
	// A cena dura o tempo do roteiro ou o tempo da fala mais uma pausa, o que for maior.
	return Math.max(roteiro, ATRASO_FALA + Math.ceil((duracoes[arquivo] + PAUSA_DEPOIS_DA_FALA) * FPS));
};

export const quadrosDoPost = (post: Post): number => post.cenas.reduce((soma, _, i) => soma + quadrosDaCena(post, i), 0);
