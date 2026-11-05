// Cada post é uma lista de cenas. Palavras entre *asteriscos* ficam em dourado.
export type Cena =
	| {tipo: 'texto'; segundos: number; linhas: string[]; destaque: boolean}
	| {tipo: 'troca'; segundos: number; linhas: string[]; de: string; para: string}
	| {tipo: 'versiculo'; segundos: number; texto: string; referencia: string}
	| {tipo: 'cta'; segundos: number; linhas: string[]; apoio: string};

export type Post = {
	id: string;
	serie: string;
	cenas: Cena[];
};
