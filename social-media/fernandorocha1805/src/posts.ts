import type {Post} from './tipos';

// Roteiros dos Reels. Para criar um post novo, copie um bloco, troque o id e as cenas.
// Palavras entre *asteriscos* aparecem em dourado.
export const posts: Post[] = [
	{
		id: 'livro-morro-dos-ventos-uivantes',
		serie: 'Livro da semana',
		voz: 'ia',
		cenas: [
			{narracao: 'Em mil oitocentos e quarenta e sete, um romance chocou a crítica.', tipo: 'texto', segundos: 3.5, destaque: true, linhas: ['Em 1847,', 'um romance', '*chocou* a crítica.']},
			{narracao: 'O livro vinha assinado por Ellis Bell. Mas quem escreveu foi Emily Brontë.', tipo: 'troca', segundos: 5, linhas: ['Vinha assinado por'], de: 'Ellis Bell', para: 'Emily Brontë'},
			{narracao: 'Foi o único romance que ela escreveu.', tipo: 'texto', segundos: 4, destaque: false, linhas: ['Foi o *único* romance', 'que ela escreveu.']},
			{narracao: 'Emily morreu um ano depois, aos trinta anos, sem ver o livro virar clássico.', tipo: 'texto', segundos: 5, destaque: false, linhas: ['Ela morreu', 'um ano depois,', 'aos *30 anos*,', 'sem ver o livro', 'virar clássico.']},
			{narracao: 'Heathcliff e Catherine vivem um amor que destrói tudo à sua volta.', tipo: 'texto', segundos: 4.5, destaque: false, linhas: ['Heathcliff', 'e Catherine:', 'um amor que *destrói*', 'tudo à sua volta.']},
			{narracao: 'No fundo, é um livro sobre o que o rancor faz com quem não perdoa.', tipo: 'texto', segundos: 4.5, destaque: false, linhas: ['No fundo, um livro', 'sobre o que', 'o *rancor* faz com', 'quem não perdoa.']},
			{narracao: 'Já leu? Salva para a sua lista.', tipo: 'cta', segundos: 3.5, linhas: ['Já leu?'], apoio: 'Salva para a sua lista.'},
		],
	},
	{
		id: 'lado-b-nirvana-unplugged',
		serie: 'Lado B',
		voz: 'ia',
		cenas: [
			{narracao: 'Dezoito de novembro de noventa e três. Nova York.', tipo: 'texto', segundos: 3, destaque: true, linhas: ['*18 de novembro*', '*de 1993.*', 'Nova York.']},
			{narracao: 'O Nirvana entra no estúdio para gravar o MTV Unplugged.', tipo: 'texto', segundos: 4, destaque: false, linhas: ['O Nirvana entra', 'no estúdio', 'para gravar o', '*MTV Unplugged*.']},
			{narracao: 'Kurt Cobain pede velas e lírios no palco. Como um funeral.', tipo: 'texto', segundos: 4.5, destaque: false, linhas: ['Kurt Cobain pede', 'velas e lírios', 'no palco,', '*como um funeral*.']},
			{narracao: 'E deixa de fora o maior sucesso da banda: Smells Like Teen Spirit.', tipo: 'texto', segundos: 4, destaque: false, linhas: ['Fora do repertório:', '*Smells Like*', '*Teen Spirit*.']},
			{narracao: 'No lugar, covers como The Man Who Sold the World, de David Bowie.', tipo: 'texto', segundos: 4.5, destaque: false, linhas: ['No lugar, covers', 'como *The Man Who*', '*Sold the World*,', 'de David Bowie.']},
			{narracao: 'Menos de cinco meses depois, Kurt morreria. E o acústico virou despedida.', tipo: 'texto', segundos: 5, destaque: false, linhas: ['Menos de cinco', 'meses depois,', 'Kurt morreria.', 'O acústico virou', '*despedida*.']},
			{narracao: 'Qual é a sua faixa preferida? Conta nos comentários.', tipo: 'cta', segundos: 4, linhas: ['Qual a sua', 'faixa preferida?'], apoio: 'Conta nos comentários.'},
		],
	},
	{
		id: 'reflexao-salmo-23',
		serie: 'Reflexão bíblica',
		voz: 'ia',
		cenas: [
			{narracao: 'O Senhor é o meu pastor; nada me faltará. Salmo vinte e três.', tipo: 'versiculo', segundos: 5.5, texto: 'O SENHOR é o meu pastor; nada me faltará.', referencia: 'Salmo 23:1 (ARA)'},
			{narracao: 'Davi conhecia ovelhas. Foi pastor antes de ser rei.', tipo: 'texto', segundos: 4, destaque: false, linhas: ['Davi conhecia', 'ovelhas.', 'Foi *pastor*', 'antes de ser rei.']},
			{narracao: 'E o pastor não tira a ovelha do caminho difícil. Ele caminha junto.', tipo: 'texto', segundos: 5, destaque: false, linhas: ['O pastor não tira', 'a ovelha do', 'caminho difícil.', 'Ele *caminha junto*.']},
			{narracao: 'Ainda que eu ande pelo vale da sombra da morte, não temerei mal nenhum, porque tu estás comigo.', tipo: 'versiculo', segundos: 7, texto: 'Ainda que eu ande pelo vale da sombra da morte, não temerei mal nenhum, porque tu estás comigo.', referencia: 'Salmo 23:4 (ARA)'},
			{narracao: 'A promessa não é uma agenda leve. É companhia no caminho.', tipo: 'texto', segundos: 5, destaque: false, linhas: ['A promessa não é', 'uma agenda leve.', 'É *companhia*', 'no caminho.']},
			{narracao: 'Qual versículo tem te sustentado? Conta aqui nos comentários.', tipo: 'cta', segundos: 4, linhas: ['Qual versículo', 'tem te sustentado?'], apoio: 'Conta aqui nos comentários.'},
		],
	},
	{
		id: 'aprendiz-zontes-s350',
		serie: 'Diário de um aprendiz',
		voz: 'fernando',
		cenas: [
			{narracao: 'Tem gente que medita.', tipo: 'texto', segundos: 2.5, destaque: true, linhas: ['Tem gente', 'que medita.']},
			{narracao: 'Eu estou aprendendo a pilotar.', tipo: 'texto', segundos: 3, destaque: true, linhas: ['Eu estou', 'aprendendo', 'a *pilotar*.']},
			{narracao: 'Desde maio, essa Zontes S350 é minha companheira.', tipo: 'texto', segundos: 4, destaque: false, linhas: ['Desde maio,', 'uma *Zontes S350*', 'é minha', 'companheira.']},
			{narracao: 'E a primeira lição foi: a moto vai para onde você olha.', tipo: 'texto', segundos: 4.5, destaque: false, linhas: ['Primeira lição:', 'a moto vai para', '*onde você olha*.']},
			{narracao: 'Então olhe para onde quer ir. Não para o buraco.', tipo: 'texto', segundos: 4.5, destaque: false, linhas: ['Então olhe para', 'onde quer ir.', '*Não para o buraco.*']},
			{narracao: 'Quem anda de moto: que conselho você daria para um iniciante?', tipo: 'cta', segundos: 4, linhas: ['Que conselho', 'você daria para', 'um iniciante?'], apoio: 'Capacete afivelado, sempre.'},
		],
	},
	// Semana 2 (16 a 22/11/2026)
	{
		id: 'reflexao-filipenses-4-13',
		serie: 'Reflexão bíblica',
		voz: 'ia',
		cenas: [
			{narracao: 'Tudo posso naquele que me fortalece. Filipenses quatro, treze.', tipo: 'versiculo', segundos: 5, texto: 'Tudo posso naquele que me fortalece.', referencia: 'Filipenses 4:13 (ARA)'},
			{narracao: 'É um dos versículos mais citados. E um dos mais mal lidos.', tipo: 'texto', segundos: 4.5, destaque: false, linhas: ['Um dos versículos', 'mais citados.', 'E um dos mais', '*mal lidos*.']},
			{narracao: 'Paulo não falava de vencer desafios. Ele escrevia da prisão.', tipo: 'texto', segundos: 4.5, destaque: false, linhas: ['Paulo não falava', 'de vencer desafios.', 'Escrevia da *prisão*.']},
			{narracao: 'Dois versículos antes, ele explica: aprendi a viver contente em toda e qualquer situação.', tipo: 'versiculo', segundos: 6, texto: 'Aprendi a viver contente em toda e qualquer situação.', referencia: 'Filipenses 4:11 (ARA)'},
			{narracao: 'O tudo posso é isto: estar em paz na fartura e na escassez.', tipo: 'texto', segundos: 5, destaque: false, linhas: ['O "tudo posso"', 'é estar em paz', 'na *fartura*', 'e na *escassez*.']},
			{narracao: 'Não é força para conseguir tudo. É força para suportar tudo.', tipo: 'texto', segundos: 4.5, destaque: false, linhas: ['Não é força para', 'conseguir tudo.', 'É força para', '*suportar tudo*.']},
			{narracao: 'Em que situação você precisa de contentamento? Conta aqui.', tipo: 'cta', segundos: 4, linhas: ['Onde você precisa', 'de *contentamento*?'], apoio: 'Conta aqui nos comentários.'},
		],
	},
	{
		id: 'aprendiz-passeios-curtos',
		serie: 'Diário de um aprendiz',
		voz: 'fernando',
		cenas: [
			{narracao: 'Por que só passeios curtos?', tipo: 'texto', segundos: 3, destaque: true, linhas: ['Por que só', '*passeios curtos*?']},
			{narracao: 'Comecei a pilotar em maio. Ainda sou aprendiz.', tipo: 'texto', segundos: 4, destaque: false, linhas: ['Comecei a pilotar', 'em *maio*.', 'Ainda sou aprendiz.']},
			{narracao: 'Cada volta curta é um treino: frenagem, curvas e atenção.', tipo: 'texto', segundos: 4.5, destaque: false, linhas: ['Cada volta curta', 'é um *treino*:', 'frenagem, curvas,', 'atenção.']},
			{narracao: 'A estrada longa vai chegar. Sem pressa.', tipo: 'texto', segundos: 4, destaque: false, linhas: ['A estrada longa', 'vai chegar.', '*Sem pressa.*']},
			{narracao: 'Melhor chegar mais tarde do que não chegar.', tipo: 'texto', segundos: 4, destaque: false, linhas: ['Melhor chegar', '*mais tarde*', 'do que não chegar.']},
			{narracao: 'Qual foi a sua primeira viagem longa? Conta aqui.', tipo: 'cta', segundos: 4, linhas: ['Qual foi a sua', 'primeira viagem', 'longa?'], apoio: 'Capacete afivelado, sempre.'},
		],
	},
];
