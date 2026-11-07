// Trilha de fundo de cada post (geradas por gerar-musica.py). Posts sem trilha recebem a música pelo Instagram.
export const musicas: Record<string, {arquivo: string; volume: number}> = {
	'especial-feliz-natal': {arquivo: 'musica/natal.mp3', volume: 0.32},
	'especial-feliz-2027': {arquivo: 'musica/ano-novo.mp3', volume: 0.3},
};
