import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './estilo';
import {quadrosDoPost} from './duracoes';
import {posts} from './posts';
import {Reel} from './Reel';
import {AnimeTeste} from './anime/Teste';
import {CONFIG_ANO_NOVO_ILUSTRADO, CONFIG_NATAL_ILUSTRADO, Ilustrado} from './anime/Ilustrado';
import {AnoNovoAnime, CONFIG_ANO_NOVO, CONFIG_NATAL, NatalAnime, quadrosAnime} from './anime/CenasAnime';

export const RemotionRoot: React.FC = () => (
	<>
		{posts.map((post) => (
			<Composition
				key={post.id}
				id={post.id}
				component={Reel}
				defaultProps={{post}}
				fps={FPS}
				width={1080}
				height={1920}
				durationInFrames={quadrosDoPost(post)}
			/>
		))}
		<Composition id="anime-teste" component={AnimeTeste} fps={FPS} width={1080} height={1920} durationInFrames={30} />
		<Composition
			id="especial-feliz-natal-anime"
			component={NatalAnime}
			defaultProps={{post: posts.find((p) => p.id === 'especial-feliz-natal')!, config: CONFIG_NATAL}}
			fps={FPS}
			width={1080}
			height={1920}
			durationInFrames={quadrosAnime(posts.find((p) => p.id === 'especial-feliz-natal')!, FPS, CONFIG_NATAL)}
		/>
		<Composition
			id="especial-feliz-2027-anime"
			component={AnoNovoAnime}
			defaultProps={{post: posts.find((p) => p.id === 'especial-feliz-2027')!, config: CONFIG_ANO_NOVO}}
			fps={FPS}
			width={1080}
			height={1920}
			durationInFrames={quadrosAnime(posts.find((p) => p.id === 'especial-feliz-2027')!, FPS, CONFIG_ANO_NOVO)}
		/>
		<Composition
			id="especial-feliz-natal-ilustrado"
			component={Ilustrado}
			defaultProps={{post: posts.find((p) => p.id === 'especial-feliz-natal')!, cena: 'natal' as const}}
			fps={FPS}
			width={1080}
			height={1920}
			durationInFrames={quadrosAnime(posts.find((p) => p.id === 'especial-feliz-natal')!, FPS, {...CONFIG_NATAL, introducao: CONFIG_NATAL_ILUSTRADO.introducao, final: CONFIG_NATAL_ILUSTRADO.final})}
		/>
		<Composition
			id="especial-feliz-2027-ilustrado"
			component={Ilustrado}
			defaultProps={{post: posts.find((p) => p.id === 'especial-feliz-2027')!, cena: 'anonovo' as const}}
			fps={FPS}
			width={1080}
			height={1920}
			durationInFrames={quadrosAnime(posts.find((p) => p.id === 'especial-feliz-2027')!, FPS, {...CONFIG_ANO_NOVO, introducao: CONFIG_ANO_NOVO_ILUSTRADO.introducao, final: CONFIG_ANO_NOVO_ILUSTRADO.final})}
		/>
	</>
);
