// Gera a narração (Azure Speech) de cada cena dos posts com voz "ia" e mede a duração de cada fala.
// Saída: public/narracao/<id>-cena-<n>.mp3 e src/narracao.json ({arquivo: segundos}).
//
// Uso: node gerar-narracao.mjs
// Variáveis: AZURE_SPEECH_REGION (padrão brazilsouth), AZURE_SPEECH_KEY (opcional: em ambientes que já
// autenticam sozinhos não é preciso), VOZ (padrão pt-BR-DonatoNeural).
import {execFileSync} from 'node:child_process';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import ts from 'typescript';

const regiao = process.env.AZURE_SPEECH_REGION ?? 'brazilsouth';
const voz = process.env.VOZ ?? 'pt-BR-DonatoNeural';

// Pronúncia aproximada dos nomes em inglês (o texto escrito continua o original).
const pronuncias = {
	'Ellis Bell': 'Élis Bél',
	'Emily Brontë': 'Émili Brontí',
	Emily: 'Émili',
	Heathcliff: 'Rítclif',
	Catherine: 'Kétrin',
	'MTV Unplugged': 'ême tê vê Ânplâguid',
	'Kurt Cobain': 'Kârt Coubêin',
	Kurt: 'Kârt',
	'Smells Like Teen Spirit': 'Smélz Laik Tín Spírit',
	'The Man Who Sold the World': 'Dâ Mén Rú Sôuld dâ Uôrld',
	'David Bowie': 'Dêivid Bôui',
	Nirvana: 'Nirvâna',
};

const escapar = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ssml = (texto) => {
	let corpo = escapar(texto);
	// Substitui os termos mais longos primeiro, com um marcador para não trocar duas vezes.
	const termos = Object.keys(pronuncias).sort((a, b) => b.length - a.length);
	const guardados = [];
	for (const termo of termos) {
		corpo = corpo.split(termo).join(`\u0000${guardados.length}\u0000`);
		guardados.push(`<sub alias="${pronuncias[termo]}">${termo}</sub>`);
	}
	corpo = corpo.replace(/\u0000(\d+)\u0000/g, (_, i) => guardados[Number(i)]);
	return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR"><voice name="${voz}">${corpo}</voice></speak>`;
};

const fonte = ts.transpileModule(readFileSync('src/posts.ts', 'utf8'), {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020}}).outputText;
const {posts} = await import(`data:text/javascript;base64,${Buffer.from(fonte).toString('base64')}`);

mkdirSync('public/narracao', {recursive: true});
const duracoes = {};
for (const post of posts.filter((p) => p.voz === 'ia')) {
	for (const [i, cena] of post.cenas.entries()) {
		if (!cena.narracao) continue;
		const arquivo = `narracao/${post.id}-cena-${i + 1}.mp3`;
		// curl em vez de fetch: respeita o proxy do ambiente (HTTPS_PROXY).
		execFileSync('curl', [
			'-sS', '--fail-with-body', '-X', 'POST', `https://${regiao}.tts.speech.microsoft.com/cognitiveservices/v1`,
			'-H', 'Content-Type: application/ssml+xml',
			'-H', 'X-Microsoft-OutputFormat: audio-48khz-192kbitrate-mono-mp3',
			'-H', 'User-Agent: fernandorocha1805-motion',
			...(process.env.AZURE_SPEECH_KEY ? ['-H', `Ocp-Apim-Subscription-Key: ${process.env.AZURE_SPEECH_KEY}`] : []),
			'--data-binary', ssml(cena.narracao),
			'-o', `public/${arquivo}`,
		]);
		const segundos = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', `public/${arquivo}`], {encoding: 'utf8'}).trim());
		duracoes[arquivo] = Math.round(segundos * 100) / 100;
		console.log(`${arquivo}  ${duracoes[arquivo]} s`);
	}
}
writeFileSync('src/narracao.json', JSON.stringify(duracoes, null, '\t') + '\n');
