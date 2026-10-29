# Vinícius Carvalho · Portfólio

Site de portfólio em React + Vite + TypeScript, com cena 3D em React Three Fiber e animações com GSAP.

## Rodar localmente

```bash
npm install
npm run dev
```

## Publicar no Render

Site estático, com etapa de build:

- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

O arquivo `render.yaml` já traz essas configurações. Se o Render criar o serviço a partir do repositório, elas são aplicadas sozinhas.

## Onde trocar o conteúdo

Tudo que é texto, link e projeto fica em `src/data/content.ts`:

- `site`: nome, cargo, texto de apresentação, e-mail, Instagram e WhatsApp.
- `stats`: números da seção Sobre.
- `projects`: os trabalhos da galeria. Para o hover tocar o vídeo, use `videoUrl` com link direto para um `.mp4`.
- `processSteps`: as etapas do processo criativo.
- `services`: a lista de serviços.

## Estrutura

- `src/sections/`: Hero, Gallery, ProjectDetail, Process, About, Contact.
- `src/components/`: navegação, cursor, preloader, textos animados e botões.
- `src/three/`: cena 3D e shaders.
- `src/styles/global.css`: tokens de cor, tipografia e estilos.
