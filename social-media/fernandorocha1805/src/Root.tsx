import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './estilo';
import {posts} from './posts';
import {Reel} from './Reel';

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
				durationInFrames={Math.round(post.cenas.reduce((soma, c) => soma + c.segundos, 0) * FPS)}
			/>
		))}
	</>
);
