import type {Post} from './tipos';

// Roteiros dos Reels. Para criar um post novo, copie um bloco, troque o id e as cenas.
// Palavras entre *asteriscos* aparecem em dourado.
export const posts: Post[] = [
	{
		id: 'livro-morro-dos-ventos-uivantes',
		serie: 'Livro da semana',
		cenas: [
			{tipo: 'texto', segundos: 3.5, destaque: true, linhas: ['Em 1847,', 'um romance', '*chocou* a crítica.']},
			{tipo: 'troca', segundos: 5, linhas: ['Vinha assinado por'], de: 'Ellis Bell', para: 'Emily Brontë'},
			{tipo: 'texto', segundos: 4, destaque: false, linhas: ['Foi o *único* romance', 'que ela escreveu.']},
			{tipo: 'texto', segundos: 5, destaque: false, linhas: ['Ela morreu um ano depois,', 'aos *30 anos*,', 'sem ver o livro', 'virar clássico.']},
			{tipo: 'texto', segundos: 4.5, destaque: false, linhas: ['Heathcliff e Catherine:', 'um amor que *destrói*', 'tudo à sua volta.']},
			{tipo: 'texto', segundos: 4.5, destaque: false, linhas: ['No fundo, um livro', 'sobre o que o *rancor*', 'faz com quem não perdoa.']},
			{tipo: 'cta', segundos: 3.5, linhas: ['Já leu?'], apoio: 'Salva para a sua lista.'},
		],
	},
	{
		id: 'lado-b-nirvana-unplugged',
		serie: 'Lado B',
		cenas: [
			{tipo: 'texto', segundos: 3, destaque: true, linhas: ['*18 de novembro*', '*de 1993.*', 'Nova York.']},
			{tipo: 'texto', segundos: 4, destaque: false, linhas: ['O Nirvana entra no estúdio', 'para gravar o', '*MTV Unplugged*.']},
			{tipo: 'texto', segundos: 4.5, destaque: false, linhas: ['Kurt Cobain pede', 'velas e lírios no palco,', '*como um funeral*.']},
			{tipo: 'texto', segundos: 4, destaque: false, linhas: ['Fora do repertório:', '*Smells Like Teen Spirit*.']},
			{tipo: 'texto', segundos: 4.5, destaque: false, linhas: ['No lugar, covers como', '*The Man Who Sold the World*,', 'de David Bowie.']},
			{tipo: 'texto', segundos: 5, destaque: false, linhas: ['Menos de cinco meses depois,', 'Kurt morreria.', 'O acústico virou *despedida*.']},
			{tipo: 'cta', segundos: 4, linhas: ['Qual a sua', 'faixa preferida?'], apoio: 'Conta nos comentários.'},
		],
	},
	{
		id: 'reflexao-salmo-23',
		serie: 'Reflexão bíblica',
		cenas: [
			{tipo: 'versiculo', segundos: 5.5, texto: 'O SENHOR é o meu pastor; nada me faltará.', referencia: 'Salmo 23:1 (ARA)'},
			{tipo: 'texto', segundos: 4, destaque: false, linhas: ['Davi conhecia ovelhas.', 'Foi *pastor*', 'antes de ser rei.']},
			{tipo: 'texto', segundos: 5, destaque: false, linhas: ['O pastor não tira a ovelha', 'do caminho difícil.', 'Ele *caminha junto*.']},
			{tipo: 'versiculo', segundos: 7, texto: 'Ainda que eu ande pelo vale da sombra da morte, não temerei mal nenhum, porque tu estás comigo.', referencia: 'Salmo 23:4 (ARA)'},
			{tipo: 'texto', segundos: 5, destaque: false, linhas: ['A promessa não é', 'uma agenda leve.', 'É *companhia* no caminho.']},
			{tipo: 'cta', segundos: 4, linhas: ['Qual versículo', 'tem te sustentado?'], apoio: 'Conta aqui nos comentários.'},
		],
	},
	{
		id: 'aprendiz-zontes-s350',
		serie: 'Diário de um aprendiz',
		cenas: [
			{tipo: 'texto', segundos: 2.5, destaque: true, linhas: ['Tem gente', 'que medita.']},
			{tipo: 'texto', segundos: 3, destaque: true, linhas: ['Eu estou', 'aprendendo', 'a *pilotar*.']},
			{tipo: 'texto', segundos: 4, destaque: false, linhas: ['Desde maio,', 'uma *Zontes S350*', 'é minha companheira.']},
			{tipo: 'texto', segundos: 4.5, destaque: false, linhas: ['Primeira lição:', 'a moto vai para', '*onde você olha*.']},
			{tipo: 'texto', segundos: 4.5, destaque: false, linhas: ['Então olhe para', 'onde quer ir.', '*Não para o buraco.*']},
			{tipo: 'cta', segundos: 4, linhas: ['Que conselho você', 'daria para um iniciante?'], apoio: 'Capacete afivelado, sempre.'},
		],
	},
];
