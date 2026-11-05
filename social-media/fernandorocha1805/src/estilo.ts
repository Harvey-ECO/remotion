import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Fontes guardadas no próprio projeto (public/fontes), para renderizar sem depender da internet.
// Montserrat é a base de todas as séries; cada série tem uma fonte de destaque.
export const montserrat = 'Montserrat';
export const playfair = 'Playfair Display';
export const cormorant = 'Cormorant Garamond';
export const bebas = 'Bebas Neue';
export const racing = 'Racing Sans One';

loadFont({family: montserrat, url: staticFile('fontes/montserrat.woff2'), weight: '100 900'});
loadFont({family: playfair, url: staticFile('fontes/playfair-italic.woff2'), style: 'italic', weight: '400 900'});
loadFont({family: cormorant, url: staticFile('fontes/cormorant.woff2'), weight: '600'});
loadFont({family: bebas, url: staticFile('fontes/bebas-neue.woff2'), weight: '400'});
loadFont({family: racing, url: staticFile('fontes/racing-sans-one.woff2'), weight: '400'});

export const cores = {
	marinho: '#0D1A3A',
	marinhoClaro: '#16295A',
	dourado: '#F2B84B',
	branco: '#F5F1E8',
};

export const FPS = 30;
export const PERFIL = '@fernandorocha1805';

export type Tema = {
	chave: 'livro' | 'rock' | 'fe' | 'moto';
	fonte: string;
	peso: number;
	maiusculas: boolean;
	tamanho: number;
	tamanhoDestaque: number;
};

// Livro: máquina de escrever e serifa clássica. Rock: cartaz de show. Fé: suave. Moto: esportiva.
const temas: Record<string, Tema> = {
	'Livro da semana': {chave: 'livro', fonte: cormorant, peso: 600, maiusculas: false, tamanho: 100, tamanhoDestaque: 124},
	'Além da toga': {chave: 'livro', fonte: cormorant, peso: 600, maiusculas: false, tamanho: 100, tamanhoDestaque: 124},
	'Lado B': {chave: 'rock', fonte: bebas, peso: 400, maiusculas: true, tamanho: 130, tamanhoDestaque: 170},
	'Reflexão bíblica': {chave: 'fe', fonte: montserrat, peso: 800, maiusculas: false, tamanho: 82, tamanhoDestaque: 104},
	'Diário de um aprendiz': {chave: 'moto', fonte: racing, peso: 400, maiusculas: false, tamanho: 96, tamanhoDestaque: 122},
};

export const temaDaSerie = (serie: string): Tema => temas[serie] ?? temas['Reflexão bíblica'];
