import {Audio} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	Img,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	type CalculateMetadataFunction,
} from 'remotion';

export type CenaIaPtBrProps = {
	// Caminho relativo à pasta `public/`, por exemplo "imagem-ia.png",
	// gerado com `gerar-imagem-hf.ts`. Use null para exibir um fundo neutro.
	readonly imagem: string | null;
	// Caminho relativo à pasta `public/`, por exemplo "narracao-ptbr.wav",
	// gerado com `narrar-ptbr.ts`. Use null para uma cena sem áudio.
	readonly narracao: string | null;
	readonly titulo: string;
	readonly duracaoEmSegundos: number;
};

export const cenaIaPtBrDefaultProps: CenaIaPtBrProps = {
	imagem: null,
	narracao: null,
	titulo: 'Cena gerada com modelos do Hugging Face',
	duracaoEmSegundos: 8,
};

export const calcularMetadadosCenaIaPtBr: CalculateMetadataFunction<
	CenaIaPtBrProps
> = ({props}) => {
	return {
		durationInFrames: Math.max(1, Math.round(props.duracaoEmSegundos * 30)),
	};
};

// Combina uma imagem gerada por IA (com zoom lento) e uma narração
// sintetizada em português.
export const CenaIaPtBr: React.FC<CenaIaPtBrProps> = ({
	imagem,
	narracao,
	titulo,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const escala = interpolate(frame, [0, durationInFrames], [1, 1.12]);
	const opacidadeTitulo = interpolate(frame, [0, 20], [0, 1], {
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{backgroundColor: '#0b1f3a'}}>
			{imagem ? (
				<AbsoluteFill style={{scale: String(escala)}}>
					<Img
						src={staticFile(imagem)}
						style={{width: '100%', height: '100%', objectFit: 'cover'}}
					/>
				</AbsoluteFill>
			) : null}
			{narracao ? <Audio src={staticFile(narracao)} /> : null}
			<AbsoluteFill
				style={{
					justifyContent: 'flex-end',
					padding: 80,
				}}
			>
				<div
					style={{
						opacity: opacidadeTitulo,
						backgroundColor: 'rgba(0, 0, 0, 0.55)',
						color: '#ffffff',
						fontFamily: 'Arial, Helvetica, sans-serif',
						fontSize: 56,
						lineHeight: 1.2,
						padding: '18px 28px',
						textAlign: 'center',
					}}
				>
					{titulo}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
