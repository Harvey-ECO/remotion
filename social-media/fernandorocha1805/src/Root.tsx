import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './estilo';
import {quadrosDoPost} from './duracoes';
import {posts} from './posts';
import {Reel} from './Reel';
import {AnimeTeste} from './anime/Teste';
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
	</>
);
