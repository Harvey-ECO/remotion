// Gera a narração (Azure Speech) de cada cena dos posts com voz "ia" e mede a duração de cada fala.
// Saída: public/narracao/<id>-cena-<n>.mp3 e src/narracao.json ({arquivo: segundos}).
//
// Uso: node gerar-narracao.mjs
// Variáveis: AZURE_SPEECH_REGION (padrão brazilsouth), AZURE_SPEECH_KEY (opcional: em ambientes que já
// autenticam sozinhos não é preciso), VOZ (padrão pt-BR-MacerioMultilingualNeural).
//
// No texto da narração, trechos entre *asteriscos* recebem ênfase (mais lentos, mais fortes e com tom marcado).
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import ts from 'typescript';

const regiao = process.env.AZURE_SPEECH_REGION ?? 'brazilsouth';
const voz = process.env.VOZ ?? 'pt-BR-MacerioMultilingualNeural';

// Tom de cada série: velocidade e altura da voz, pausas de respiração (ms) e como soa a ênfase.
const estilos = {
	// Rock: animado, alegre (sem exagero).
	'Lado B': {rate: '+2%', pitch: '+3%', virgula: 200, ponto: 450, enfase: {rate: '-4%', pitch: '+5%', volume: '+8%'}},
	// Bíblia: ponderado, reflexivo, com pausas longas.
	'Reflexão bíblica': {rate: '-12%', pitch: '-4%', virgula: 380, ponto: 850, enfase: {rate: '-22%', pitch: '-6%', volume: '+12%'}},
	// Livro: contador de histórias, leve.
	'Livro da semana': {rate: '-2%', pitch: '+0%', virgula: 260, ponto: 600, enfase: {rate: '-6%', pitch: '+3%', volume: '+6%'}},
	// Mensagens de Natal e Ano Novo: calorosas e serenas.
	'Feliz Natal': {rate: '-6%', pitch: '-1%', virgula: 320, ponto: 650, enfase: {rate: '-12%', pitch: '+3%', volume: '+8%'}},
	'Feliz 2027': {rate: '-4%', pitch: '+1%', virgula: 300, ponto: 600, enfase: {rate: '-10%', pitch: '+4%', volume: '+8%'}},
	// Dia a dia: conversa informal.
	'Diário de um aprendiz': {rate: '+1%', pitch: '+1%', virgula: 180, ponto: 420, enfase: {rate: '-4%', pitch: '+3%', volume: '+6%'}},
};
// Falas que pedem um tom diferente do resto da série.
const ajustes = {
	// A morte de Kurt Cobain: mais contida, mesmo dentro do tom alegre do Lado B.
	'lado-b-nirvana-unplugged-cena-6': {rate: '-4%', pitch: '-2%', virgula: 300, ponto: 650, enfase: {rate: '-8%', pitch: '-2%', volume: '+5%'}},
};

// Nomes estrangeiros: a voz é multilíngue e troca de idioma só nesses trechos, com a pronúncia
// fixada pela transcrição fonética (IPA) e um pouco mais devagar, para ficar clara.
const estrangeiros = {
	'The Man Who Sold the World': ['en-US', 'ðə mæn huː soʊld ðə wɝːld'],
	'Smells Like Teen Spirit': ['en-US', 'smɛlz laɪk tiːn ˈspɪrɪt'],
	'Gustave Flaubert': ['fr-FR', 'ɡys.tav flo.bɛʁ'],
	'Madame Bovary': ['fr-FR', 'ma.dam bɔ.va.ʁi'],
	'Ernest Pinard': ['fr-FR', 'ɛʁ.nɛst pi.naʁ'],
	'No Leaf Clover': ['en-US', 'noʊ liːf ˈkloʊvɚ'],
	'MTV Unplugged': ['en-US', 'ˌɛm tiː ˈviː ʌnˈplʌɡd'],
	'Michael Kamen': ['en-US', 'ˈmaɪkəl ˈkeɪmən'],
	'Emily Brontë': ['en-US', 'ˈɛməli ˈbrɒnti'],
	'David Bowie': ['en-US', 'ˈdeɪvɪd ˈboʊi'],
	'Kurt Cobain': ['en-US', 'kɝːt koʊˈbeɪn'],
	'Ellis Bell': ['en-US', 'ˈɛlɪs bɛl'],
	Heathcliff: ['en-US', 'ˈhiːθklɪf'],
	Catherine: ['en-US', 'ˈkæθrɪn'],
	Berkeley: ['en-US', 'ˈbɝːkli'],
	Flaubert: ['fr-FR', 'flo.bɛʁ'],
	'S&M': ['en-US', 'ˌɛs ən ˈɛm'],
	Emily: ['en-US', 'ˈɛməli'],
	Kurt: ['en-US', 'kɝːt'],
	'Ichiro Kishimi': ['en-US', 'ˈiːtʃiroʊ kiˈʃiːmi'],
	'Fumitake Koga': ['en-US', 'fuːmiˈtɑːkeɪ ˈkoʊɡə'],
	'Alfred Adler': ['de-DE', 'ˈalfʁeːt ˈaːdlɐ'],
	'Spin the Black Circle': ['en-US', 'spɪn ðə blæk ˈsɝːkəl'],
	'Eddie Vedder': ['en-US', 'ˈɛdi ˈvɛdɚ'],
	'Better Man': ['en-US', 'ˈbɛɾɚ mæn'],
	'Pearl Jam': ['en-US', 'pɝːl dʒæm'],
	Vitalogy: ['en-US', 'vaɪˈtɑːlədʒi'],
	"Do They Know It's Christmas": ['en-US', 'duː ðeɪ noʊ ɪts ˈkɹɪsməs'],
	'Ebenezer Scrooge': ['en-US', 'ˌɛbəˈniːzɚ skɹuːdʒ'],
	'Charles Dickens': ['en-US', 'ˈtʃɑːɹlz ˈdɪkɪnz'],
	'Simon Le Bon': ['en-US', 'ˈsaɪmən lə ˈbɑn'],
	'Duran Duran': ['en-US', 'dʊˈɹæn dʊˈɹæn'],
	'Arthur Bloch': ['en-US', 'ˈɑɹθɚ blɑk'],
	'Bob Geldof': ['en-US', 'bɑb ˈɡɛldɑf'],
	'Midge Ure': ['en-US', 'mɪdʒ ˈjʊɚ'],
	Incesticide: ['en-US', 'ɪnˈsɛstɪsaɪd'],
	Scrooge: ['en-US', 'skɹuːdʒ'],
	Dickens: ['en-US', 'ˈdɪkɪnz'],
	Adler: ['de-DE', 'ˈaːdlɐ'],
	'Baltasar Gracián': ['es-ES', 'baltaˈsaɾ ɡɾaˈθjan'],
	'Byung-Chul Han': ['en-US', 'bjʌŋ tʃʊl hɑn'],
	'Susan Cain': ['en-US', 'ˈsuːzən keɪn'],
	'Mark Manson': ['en-US', 'mɑɹk ˈmænsən'],
};
const termosEstrangeiros = Object.keys(estrangeiros);

const escapar = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Pausas de respiração depois de vírgulas e pontos, dentro de um trecho em português.
const comPausas = (texto, estilo) =>
	escapar(texto)
		.replace(/([,;])\s+/g, `$1<break time="${estilo.virgula}ms"/> `)
		.replace(/([.!?:])\s+/g, `$1<break time="${estilo.ponto}ms"/> `);

const ssml = (texto, estilo) => {
	// 1. Separa os trechos com ênfase (*...*).
	const partes = texto.split(/\*([^*]+)\*/).map((t, i) => ({t, enfase: i % 2 === 1}));
	let corpo = '';
	for (const {t, enfase} of partes) {
		if (!t) continue;
		// 2. Dentro de cada trecho, separa os nomes em inglês.
		const regex = new RegExp(`(${termosEstrangeiros.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`);
		const pedacos = t.split(regex);
		let trecho = '';
		for (const [k, p] of pedacos.entries()) {
			if (!p) continue;
			trecho += k % 2 === 1 ? `<lang xml:lang="${estrangeiros[p][0]}"><prosody rate="-8%"><phoneme alphabet="ipa" ph="${estrangeiros[p][1]}">${escapar(p)}</phoneme></prosody></lang>` : `<lang xml:lang="pt-BR">${comPausas(p, estilo)}</lang>`;
		}
		corpo += enfase ? `<prosody rate="${estilo.enfase.rate}" pitch="${estilo.enfase.pitch}" volume="${estilo.enfase.volume}">${trecho}</prosody>` : trecho;
	}
	return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR"><voice name="${voz}"><prosody rate="${estilo.rate}" pitch="${estilo.pitch}">${corpo}</prosody></voice></speak>`;
};

const fonte = ts.transpileModule(readFileSync('src/posts.ts', 'utf8'), {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020}}).outputText;
const {posts} = await import(`data:text/javascript;base64,${Buffer.from(fonte).toString('base64')}`);

mkdirSync('public/narracao', {recursive: true});
// POSTS=id1,id2 gera só esses posts e mantém as durações já medidas dos outros.
const somente = process.env.POSTS ? process.env.POSTS.split(',') : null;
const duracoes = somente && existsSync('src/narracao.json') ? JSON.parse(readFileSync('src/narracao.json', 'utf8')) : {};
for (const post of posts.filter((p) => p.voz === 'ia' && (!somente || somente.includes(p.id)))) {
	for (const [i, cena] of post.cenas.entries()) {
		if (!cena.narracao) continue;
		const nome = `${post.id}-cena-${i + 1}`;
		const arquivo = `narracao/${nome}.mp3`;
		const estilo = ajustes[nome] ?? estilos[post.serie] ?? estilos['Livro da semana'];
		// curl em vez de fetch: respeita o proxy do ambiente (HTTPS_PROXY).
		execFileSync('curl', [
			'-sS', '--fail-with-body', '-X', 'POST', `https://${regiao}.tts.speech.microsoft.com/cognitiveservices/v1`,
			'-H', 'Content-Type: application/ssml+xml',
			'-H', 'X-Microsoft-OutputFormat: audio-48khz-192kbitrate-mono-mp3',
			'-H', 'User-Agent: fernandorocha1805-motion',
			...(process.env.AZURE_SPEECH_KEY ? ['-H', `Ocp-Apim-Subscription-Key: ${process.env.AZURE_SPEECH_KEY}`] : []),
			'--data-binary', ssml(cena.narracao, estilo),
			'-o', `public/${arquivo}`,
		]);
		const segundos = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', `public/${arquivo}`], {encoding: 'utf8'}).trim());
		duracoes[arquivo] = Math.round(segundos * 100) / 100;
		console.log(`${arquivo}  ${duracoes[arquivo]} s`);
	}
}
writeFileSync('src/narracao.json', JSON.stringify(Object.fromEntries(Object.entries(duracoes).sort()), null, '\t') + '\n');
