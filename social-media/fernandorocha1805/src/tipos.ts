// Cada post é uma lista de cenas. Palavras entre *asteriscos* ficam em dourado.
// narracao: o texto falado durante a cena (null quando a cena não tem fala).
export type Cena = {narracao: string | null} & (
	| {tipo: 'texto'; segundos: number; linhas: string[]; destaque: boolean}
	| {tipo: 'troca'; segundos: number; linhas: string[]; de: string; para: string}
	| {tipo: 'versiculo'; segundos: number; texto: string; referencia: string}
	| {tipo: 'cta'; segundos: number; linhas: string[]; apoio: string}
);

export type Post = {
	id: string;
	serie: string;
	// ia: voz sintetizada masculina; fernando: gravada pelo próprio Fernando (posts em primeira pessoa).
	voz: 'ia' | 'fernando';
	cenas: Cena[];
};
