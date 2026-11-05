// Gera uma imagem a partir de uma descrição em texto usando a API de
// inferência do Hugging Face (Inference Providers, provedor "hf-inference").
//
// ATENÇÃO: esta API exige um token de acesso do Hugging Face.
// Crie um token do tipo "Read" (ou "Fine-grained" com permissão
// "Make calls to Inference Providers") em
// https://huggingface.co/settings/tokens e defina-o na variável de ambiente
// HF_TOKEN. Nunca grave o token no código nem o envie ao repositório.
//
// Uso:
//   HF_TOKEN=hf_xxx bun gerar-imagem-hf.ts "descrição da imagem" [public/imagem-ia.png] [modelo]
//
// Dica: modelos de imagem entendem melhor descrições em inglês.

import {writeFile} from 'node:fs/promises';

const [
	descricao,
	saida = 'public/imagem-ia.png',
	modelo = 'black-forest-labs/FLUX.1-schnell',
] = process.argv.slice(2);

if (!descricao) {
	console.error(
		'Uso: HF_TOKEN=hf_xxx bun gerar-imagem-hf.ts "descrição" [saida.png] [modelo]',
	);
	process.exit(1);
}

const token = process.env.HF_TOKEN;
if (!token) {
	console.error(
		'Defina a variável de ambiente HF_TOKEN com um token de acesso do Hugging Face (https://huggingface.co/settings/tokens).',
	);
	process.exit(1);
}

const url = `https://router.huggingface.co/hf-inference/models/${modelo}`;

console.log(`Gerando imagem com "${modelo}"...`);
const resposta = await fetch(url, {
	method: 'POST',
	headers: {
		Authorization: `Bearer ${token}`,
		'Content-Type': 'application/json',
		Accept: 'image/png',
	},
	body: JSON.stringify({inputs: descricao}),
});

if (!resposta.ok) {
	const detalhe = await resposta.text();
	throw new Error(
		`A API do Hugging Face respondeu ${resposta.status} ${resposta.statusText}: ${detalhe}`,
	);
}

const tipo = resposta.headers.get('content-type') ?? '';
if (!tipo.startsWith('image/')) {
	throw new Error(`Resposta inesperada (${tipo}): ${await resposta.text()}`);
}

await writeFile(saida, new Uint8Array(await resposta.arrayBuffer()));
console.log(`Imagem gravada em ${saida}.`);
