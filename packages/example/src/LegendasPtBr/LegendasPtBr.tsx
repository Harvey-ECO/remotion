import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {BasicCaptions} from './basic-captions';

export const LEGENDAS_PT_BR_DURATION_IN_FRAMES = 240;

// Legendas de demonstração em português do Brasil.
// Substitua o array abaixo pelo conteúdo do JSON gerado por
// `bun transcrever-ptbr.ts <arquivo>`, que transcreve o áudio com o
// modelo Whisper multilíngue hospedado no Hugging Face.
export const LegendasPtBr: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				background: 'linear-gradient(160deg, #0b1f3a 0%, #13315c 100%)',
			}}
		>
			<Sequence name="Legendas PT-BR">
				<BasicCaptions
					name="Legendas PT-BR"
					width={900}
					style={{
						position: 'absolute',
						bottom: 160,
						translate: '90px 0px',
					}}
					captions={[
						{
							text: 'Estas',
							startMs: 0,
							endMs: 400,
							timestampMs: 200,
							confidence: null,
						},
						{
							text: ' legendas',
							startMs: 400,
							endMs: 900,
							timestampMs: 650,
							confidence: null,
						},
						{
							text: ' foram',
							startMs: 900,
							endMs: 1200,
							timestampMs: 1050,
							confidence: null,
						},
						{
							text: ' geradas',
							startMs: 1200,
							endMs: 1700,
							timestampMs: 1450,
							confidence: null,
						},
						{
							text: ' com',
							startMs: 1700,
							endMs: 1900,
							timestampMs: 1800,
							confidence: null,
						},
						{
							text: ' o',
							startMs: 1900,
							endMs: 2000,
							timestampMs: 1950,
							confidence: null,
						},
						{
							text: ' Whisper,',
							startMs: 2000,
							endMs: 2600,
							timestampMs: 2300,
							confidence: null,
						},
						{
							text: ' do',
							startMs: 2600,
							endMs: 2800,
							timestampMs: 2700,
							confidence: null,
						},
						{
							text: ' Hugging',
							startMs: 2800,
							endMs: 3200,
							timestampMs: 3000,
							confidence: null,
						},
						{
							text: ' Face.',
							startMs: 3200,
							endMs: 3800,
							timestampMs: 3500,
							confidence: null,
						},
						{
							text: ' A',
							startMs: 4200,
							endMs: 4300,
							timestampMs: 4250,
							confidence: null,
						},
						{
							text: ' transcrição',
							startMs: 4300,
							endMs: 5000,
							timestampMs: 4650,
							confidence: null,
						},
						{
							text: ' roda',
							startMs: 5000,
							endMs: 5300,
							timestampMs: 5150,
							confidence: null,
						},
						{
							text: ' localmente,',
							startMs: 5300,
							endMs: 6000,
							timestampMs: 5650,
							confidence: null,
						},
						{
							text: ' na',
							startMs: 6000,
							endMs: 6200,
							timestampMs: 6100,
							confidence: null,
						},
						{
							text: ' GPU.',
							startMs: 6200,
							endMs: 7000,
							timestampMs: 6600,
							confidence: null,
						},
					]}
				/>
			</Sequence>
		</AbsoluteFill>
	);
};
