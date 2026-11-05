import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Fontes guardadas no próprio projeto (public/fontes), para renderizar sem depender da internet.
// Montserrat é uma fonte variável: o mesmo arquivo serve os pesos 600 e 800.
export const montserrat = 'Montserrat';
export const playfair = 'Playfair Display';

loadFont({family: montserrat, url: staticFile('fontes/montserrat.woff2'), weight: '100 900'});
loadFont({family: playfair, url: staticFile('fontes/playfair-italic.woff2'), style: 'italic', weight: '400 900'});

export const cores = {
	marinho: '#0D1A3A',
	marinhoClaro: '#16295A',
	dourado: '#F2B84B',
	branco: '#F5F1E8',
};

export const FPS = 30;
export const PERFIL = '@fernandorocha1805';
