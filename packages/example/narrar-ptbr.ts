// Gera uma narração em português a partir de um texto, com o modelo de voz
// MMS-TTS (Meta) convertido para ONNX e hospedado no Hugging Face
// (Xenova/mms-tts-por). A síntese roda localmente, na CPU, via
// @huggingface/transformers. Não há necessidade de token.
//
// Uso:
//   bun narrar-ptbr.ts "Texto a ser narrado." [public/narracao-ptbr.wav] [modelo]
//
// O modelo é baixado do huggingface.co na primeira execução e fica em cache.
// O arquivo .wav gerado pode ser usado na composição `cena-ia-pt-br`
// (prop `narracao`) e transcrito com `transcrever-ptbr.ts` para gerar as
// legendas sincronizadas.

import {pipeline} from '@huggingface/transformers';

const [
	texto,
	saida = 'public/narracao-ptbr.wav',
	modelo = 'Xenova/mms-tts-por',
] = process.argv.slice(2);

if (!texto) {
	console.error(
		'Uso: bun narrar-ptbr.ts "Texto a ser narrado." [saida.wav] [modelo]',
	);
	process.exit(1);
}

console.log(`Carregando o modelo de voz "${modelo}" do Hugging Face...`);
const sintetizador = await pipeline('text-to-speech', modelo, {dtype: 'fp32'});

console.log('Sintetizando a narração...');
const audio = await sintetizador(texto);
await audio.save(saida);

const duracaoEmSegundos = audio.audio.length / audio.sampling_rate;
console.log(
	`Narração gravada em ${saida} (${duracaoEmSegundos.toFixed(1)} s, ${audio.sampling_rate} Hz).`,
);

await sintetizador.dispose();
