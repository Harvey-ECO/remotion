# Motion graphics — @fernandorocha1805

Projeto em [Remotion](https://www.remotion.dev) que gera os Reels do perfil pessoal no Instagram, na identidade visual azul-marinho e dourada.

## Séries prontas

| Arquivo gerado | Série | Duração |
| --- | --- | --- |
| `out/livro-morro-dos-ventos-uivantes.mp4` | Livro da semana | 30 s |
| `out/lado-b-nirvana-unplugged.mp4` | Lado B | 29 s |
| `out/reflexao-salmo-23.mp4` | Reflexão bíblica | 30,5 s |
| `out/aprendiz-zontes-s350.mp4` | Diário de um aprendiz | 22,5 s |
| `out/reflexao-filipenses-4-13.mp4` | Reflexão bíblica | 33,5 s |
| `out/aprendiz-passeios-curtos.mp4` | Diário de um aprendiz | 23,5 s |

## Identidade de cada série

A Montserrat é a base de todas as séries (selo, @ e textos de apoio). Cada série tem fonte, movimento e fundo próprios, definidos pelo nome da série em `src/estilo.ts`:

| Série | Fonte de destaque | Entrada do texto | Fundo | Transição |
| --- | --- | --- | --- | --- |
| Livro da semana | Cormorant Garamond | Máquina de escrever, com cursor | Papel envelhecido e moldura dupla | Página virando |
| Lado B | Bebas Neue | Impacto, com separação de cores nas palavras douradas | Vinil girando, cordas vibrando, granulado de filme | Corte com falha |
| Reflexão bíblica | Montserrat e Playfair Display | Suave, com desfoque | Raios de luz e poeira dourada | Aproximação lenta e clarão |
| Diário de um aprendiz | Racing Sans One | Deslize lateral | Estrada com faixas passando, linhas de velocidade e velocímetro | Arrancada para a esquerda |

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
- As fontes (Montserrat, Playfair Display, Cormorant Garamond, Bebas Neue e Racing Sans One, todas com licença SIL Open Font License) estão em `public/fontes`.
- Licença do Remotion: uso gratuito por pessoa física e por empresas de até 3 funcionários. Para uso pelo escritório, consulte <https://remotion.pro/license>.
