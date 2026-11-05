# Motion graphics — @fernandorocha1805

Projeto em [Remotion](https://www.remotion.dev) que gera os Reels do perfil pessoal no Instagram, na identidade visual azul-marinho e dourada.

## Séries prontas

| Arquivo gerado | Série | Duração |
| --- | --- | --- |
| `out/livro-morro-dos-ventos-uivantes.mp4` | Livro da semana | 30 s |
| `out/lado-b-nirvana-unplugged.mp4` | Lado B | 29 s |
| `out/reflexao-salmo-23.mp4` | Reflexão bíblica | 30,5 s |
| `out/aprendiz-zontes-s350.mp4` | Diário de um aprendiz | 22,5 s |

Cada vídeo também gera uma capa em `out/<id>-capa.png`.

## Como usar

```bash
npm install
npm run studio        # pré-visualização no navegador
npm run render:todos  # gera todos os vídeos e capas em out/
```

## Como criar um post novo

1. Abra `src/posts.ts`.
2. Copie um bloco existente e troque o `id`, a `serie` e as `cenas`.
3. Tipos de cena:
   - `texto`: linhas que entram palavra por palavra (`destaque: true` deixa a letra maior);
   - `troca`: um nome é riscado e substituído por outro;
   - `versiculo`: citação em itálico com a referência;
   - `cta`: chamada final com ícone de salvar.
4. Palavras entre `*asteriscos*` aparecem em dourado.

## Observações

- Formato: 1080 × 1920, 30 quadros por segundo, H.264. O texto fica dentro da área segura do Reels.
- Os vídeos saem sem música. Adicione o áudio pelo próprio Instagram, que já tem as licenças.
- As fontes Montserrat e Playfair Display (licença SIL Open Font License) estão em `public/fontes`.
- Licença do Remotion: uso gratuito por pessoa física e por empresas de até 3 funcionários. Para uso pelo escritório, consulte <https://remotion.pro/license>.
