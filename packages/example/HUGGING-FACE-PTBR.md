# Hugging Face no Remotion: guia em português

Este guia reúne as integrações do Remotion com modelos hospedados no
[Hugging Face](https://huggingface.co) e os exemplos em português do Brasil
deste pacote (`packages/example`).

## 1. Integrações já existentes no Remotion

| Pacote | Finalidade | Modelos do Hugging Face | Requisitos |
| --- | --- | --- | --- |
| `@remotion/whisper-webgpu` | Transcrição de áudio e geração de legendas, no Node.js ou no navegador | `onnx-community/whisper-*_timestamped` | GPU com WebGPU |
| `@remotion/whisper-web` | Transcrição no navegador com whisper.cpp em WebAssembly | `ggerganov/whisper.cpp` | Navegador moderno |
| `@remotion/video-matting` | Remoção de fundo de vídeos (camadas base e primeiro plano) | `Xenova/modnet`, `onnx-community/BEN2-ONNX` (espelhados em `remotion.media`) | GPU com WebGPU |

Todas usam a biblioteca `@huggingface/transformers` (versão 4.2.0) e baixam
os modelos automaticamente na primeira execução. Nenhuma delas exige token.

Documentação oficial (em inglês):

- <https://www.remotion.dev/docs/whisper-webgpu>
- <https://www.remotion.dev/docs/whisper-web>
- <https://www.remotion.dev/docs/video-matting>

## 2. Exemplos deste pacote

Todos os comandos abaixo devem ser executados dentro de `packages/example`.

### 2.1 Narração em português (TTS)

```bash
bun narrar-ptbr.ts "Bem-vindo ao nosso escritório." public/narracao-ptbr.wav
```

- Modelo: `Xenova/mms-tts-por` (MMS-TTS, da Meta, convertido para ONNX).
- Roda localmente, na CPU, e não exige token.

### 2.2 Legendas em português

```bash
bun transcrever-ptbr.ts public/narracao-ptbr.wav legendas.json small
```

- Modelos multilíngues: `tiny`, `base`, `small` (padrão), `medium` e
  `large-v3-turbo`.
- Exige GPU com WebGPU.
- Copie o conteúdo de `legendas.json` para a prop `captions` de
  `<BasicCaptions>` em `src/LegendasPtBr/LegendasPtBr.tsx` (composição
  `legendas-pt-br`).

### 2.3 Imagens geradas por IA

> **Atenção: exige token de acesso do Hugging Face.**
> Crie um token em <https://huggingface.co/settings/tokens> e informe-o pela
> variável de ambiente `HF_TOKEN`. Nunca grave o token em arquivos do
> repositório. O uso pode consumir créditos da sua conta no Hugging Face.

```bash
HF_TOKEN=hf_xxx bun gerar-imagem-hf.ts "modern law office, warm light, photorealistic" public/imagem-ia.png
```

- Modelo padrão: `black-forest-labs/FLUX.1-schnell`, pelo provedor
  `hf-inference`.
- Descrições em inglês costumam produzir resultados melhores.

### 2.4 Cena combinada

A composição `cena-ia-pt-br` (`src/LegendasPtBr/CenaIaPtBr.tsx`) reúne a
imagem gerada (com zoom lento), a narração e um título. No Remotion Studio,
ajuste as props:

```json
{
  "imagem": "imagem-ia.png",
  "narracao": "narracao-ptbr.wav",
  "titulo": "Cena gerada com modelos do Hugging Face",
  "duracaoEmSegundos": 8
}
```

Ajuste `duracaoEmSegundos` conforme a duração informada por
`narrar-ptbr.ts`.

## 3. Fluxo completo sugerido

1. Gerar a narração com `narrar-ptbr.ts`.
2. Transcrever a narração com `transcrever-ptbr.ts` para obter legendas
   sincronizadas.
3. Gerar a imagem de fundo com `gerar-imagem-hf.ts`.
4. Montar a cena no Remotion Studio (`bun run dev`) e renderizar.

## 4. Licenças

Verifique a licença de cada modelo na respectiva página do Hugging Face
antes de uso comercial. O MMS-TTS é distribuído sob licença CC BY-NC 4.0,
que **não permite uso comercial**. O FLUX.1-schnell é distribuído sob
licença Apache 2.0.
