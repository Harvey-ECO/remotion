// Transcreve um arquivo de áudio ou vídeo em português do Brasil com o
// Whisper multilíngue hospedado no Hugging Face (onnx-community) e grava as
// legendas no formato `Caption` do @remotion/captions.
//
// Uso:
//   bun transcrever-ptbr.ts public/meu-video.mp4 [saida.json] [modelo]
//
// Modelos multilíngues: tiny, base, small (padrão), medium, large-v3-turbo.
// O modelo é baixado do huggingface.co na primeira execução e fica em cache.
// Requer uma GPU compatível com WebGPU. Não há necessidade de token.

import {writeFile} from 'node:fs/promises';
import {registerMediabunnyServer} from '@mediabunny/server';
import {
	WHISPER_WEBGPU_SAMPLE_RATE,
	canUseWhisperWebGpu,
	disposeWhisperModel,
	downloadWhisperModel,
	getAvailableModels,
	loadWhisperModel,
	toCaptions,
	transcribe,
} from '@remotion/whisper-webgpu';
import {
	ALL_FORMATS,
	Conversion,
	FilePathSource,
	Input,
	NullTarget,
	Output,
	WavOutputFormat,
} from 'mediabunny';

const [arquivo, saida = 'legendas-ptbr.json', modeloArg = 'small'] =
	process.argv.slice(2);

if (!arquivo) {
	console.error('Uso: bun transcrever-ptbr.ts <arquivo> [saida.json] [modelo]');
	process.exit(1);
}

const modelos = getAvailableModels();
const infoModelo = modelos.find((m) => m.name === modeloArg);
if (!infoModelo || !infoModelo.multilingual) {
	console.error(
		`Modelo inválido para português: "${modeloArg}". Use um destes: ${modelos
			.filter((m) => m.multilingual)
			.map((m) => m.name)
			.join(', ')}`,
	);
	process.exit(1);
}

const model = infoModelo.name;

registerMediabunnyServer();

const support = await canUseWhisperWebGpu();
if (!support.supported) {
	throw new Error(support.detailedReason);
}

type WaveformChunk = {
	startFrame: number;
	waveform: Float32Array;
};
const chunks: WaveformChunk[] = [];

using input = new Input({
	formats: ALL_FORMATS,
	source: new FilePathSource(arquivo),
});
const audioTrack = await input.getPrimaryAudioTrack();
if (audioTrack === null) {
	throw new Error('O arquivo não contém faixa de áudio.');
}

const conversion = await Conversion.init({
	input,
	output: new Output({
		format: new WavOutputFormat(),
		target: new NullTarget(),
	}),
	video: {discard: true},
	audio: (track) => {
		if (track.id !== audioTrack.id) {
			return {discard: true};
		}

		return {
			codec: 'pcm-f32',
			forceTranscode: true,
			numberOfChannels: 1,
			sampleFormat: 'f32',
			sampleRate: WHISPER_WEBGPU_SAMPLE_RATE,
			process: (sample) => {
				const waveform = new Float32Array(
					sample.allocationSize({format: 'f32', planeIndex: 0}) /
						Float32Array.BYTES_PER_ELEMENT,
				);
				sample.copyTo(waveform, {format: 'f32', planeIndex: 0});
				chunks.push({
					startFrame: Math.round(sample.timestamp * WHISPER_WEBGPU_SAMPLE_RATE),
					waveform,
				});
				return sample;
			},
		};
	},
});

if (!conversion.isValid) {
	throw new Error('Não foi possível decodificar a faixa de áudio.');
}

await conversion.execute();

const waveformLength = chunks.reduce(
	(max, chunk) => Math.max(max, chunk.startFrame + chunk.waveform.length),
	0,
);
const channelWaveform = new Float32Array(waveformLength);
for (const chunk of chunks) {
	const destinationStart = Math.max(0, chunk.startFrame);
	const sourceStart = Math.max(0, -chunk.startFrame);
	const availableLength = Math.min(
		chunk.waveform.length - sourceStart,
		channelWaveform.length - destinationStart,
	);

	if (availableLength > 0) {
		channelWaveform.set(
			chunk.waveform.subarray(sourceStart, sourceStart + availableLength),
			destinationStart,
		);
	}
}

console.log(
	`Baixando o modelo "${model}" do Hugging Face (${infoModelo.modelId})...`,
);
await downloadWhisperModel({model});
await loadWhisperModel({model});

console.log('Transcrevendo em português...');
const transcription = await transcribe({
	channelWaveform,
	model,
	language: 'pt',
});
const {captions} = toCaptions({whisperWebGpuOutput: transcription});
await disposeWhisperModel({model});

await writeFile(saida, JSON.stringify(captions, null, 2));
console.log(
	`${captions.length} legendas gravadas em ${saida}. Copie o conteúdo para a prop "captions" de <BasicCaptions> em src/LegendasPtBr/LegendasPtBr.tsx.`,
);
