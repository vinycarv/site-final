// Conteúdo centralizado. Troque textos, links e projetos aqui; o site inteiro se atualiza.

export const site = {
  name: 'Vinícius Carvalho',
  role: 'Editor · Filmmaker · Creative',
  tagline: 'Histórias que prendem a atenção.',
  intro:
    'Edito e filmo vídeos para marcas, artistas e criadores. Cada corte é pensado para o ritmo da história, do primeiro quadro ao último.',
  email: 'vinysilva1914@gmail.com',
  instagram: 'https://www.instagram.com/viny_carv',
  instagramHandle: '@viny_carv',
  // WhatsApp: +55 11 93536-0112
  whatsapp: 'https://wa.me/5511935360112?text=Oi%20Vin%C3%ADcius%2C%20vi%20seu%20portf%C3%B3lio%20e%20quero%20conversar',
  whatsappLabel: '+55 11 93536-0112',
  // Deixe vazio até ter um showreel real. Com vazio, o hero usa a composição autoral em 3D.
  showreelUrl: '',
};

// Estatísticas informadas por você (verificadas pelo titular).
export const stats = [
  { value: 6, prefix: '', suffix: '', label: 'anos de experiência' },
  { value: 700, prefix: '+', suffix: '', label: 'projetos entregues' },
  { value: 50, prefix: '+', suffix: '', label: 'clientes atendidos' },
];

// Projetos: espaços para você. Troque título, categoria, vídeo e capa quando tiver os arquivos.
// videoUrl: link direto de um .mp4 (o player do Drive não toca sozinho no hover).
export type Project = {
  id: string;
  number: string;
  title: string;
  category: string;
  year: string;
  description: string;
  role: string;
  format: string;
  thumb: string; // caminho em /public/assets, ou vazio para a capa gerada
  videoUrl: string;
  externalUrl: string;
  tone: [string, string]; // cores da capa gerada enquanto não há miniatura
};

export const projects: Project[] = [
  {
    id: 'congressos', number: '01', title: 'Congressos', category: 'Eventos', year: '2026',
    description: 'Cobertura e edição de congressos: cortes de palco, depoimentos e resumos para divulgação.',
    role: 'Edição, cor', format: '16:9', thumb: '', videoUrl: 'https://drive.google.com/uc?export=download&id=1PvVoL0sIBVWj-xKHEMtgH03wEZSfycwh',
    externalUrl: 'https://drive.google.com/file/d/1PvVoL0sIBVWj-xKHEMtgH03wEZSfycwh/view?usp=drive_link',
    tone: ['#ff5a1f', '#1a0d07'],
  },
  {
    id: 'verticais', number: '02', title: 'Verticais', category: 'Conteúdo vertical', year: '2026',
    description: 'Vídeos em formato vertical para Reels, TikTok e Shorts, com ritmo e legenda pensados para o celular.',
    role: 'Edição, motion', format: '9:16', thumb: '', videoUrl: 'https://drive.google.com/uc?export=download&id=1CxrlV3Fb6e0NnWtSYTs83AtAATtJLtBL',
    externalUrl: 'https://drive.google.com/file/d/1CxrlV3Fb6e0NnWtSYTs83AtAATtJLtBL/view?usp=drive_link',
    tone: ['#ffb07a', '#0b0b0d'],
  },
  {
    id: 'cinematograficos', number: '03', title: 'Cinematográficos', category: 'Filme', year: '2026',
    description: 'Projetos de narrativa com tratamento de cor de cinema, enquadramento e trilha pensados para a tela grande.',
    role: 'Direção, edição, color grading', format: '16:9', thumb: '', videoUrl: 'https://drive.google.com/uc?export=download&id=1E5M0x7AFm21I2A81pers3Kmsg63JNMVi',
    externalUrl: 'https://drive.google.com/file/d/1E5M0x7AFm21I2A81pers3Kmsg63JNMVi/view?usp=drive_link',
    tone: ['#c2410c', '#151517'],
  },
  {
    id: 'virais', number: '04', title: 'Virais', category: 'Redes sociais', year: '2026',
    description: 'Vídeos curtos feitos para prender a atenção nos primeiros segundos e gerar compartilhamento.',
    role: 'Edição, legenda', format: '9:16', thumb: '', videoUrl: 'https://drive.google.com/uc?export=download&id=1m2_Ydy2m9n4UR1CEElMjNYnyiSNnR2ZC',
    externalUrl: 'https://drive.google.com/file/d/1m2_Ydy2m9n4UR1CEElMjNYnyiSNnR2ZC/view?usp=drive_link',
    tone: ['#ff7a35', '#222225'],
  },
];

export const processSteps = [
  { id: 'roteiro', code: '00:00:00:00', title: 'Roteiro e decupagem', text: 'Antes de gravar, defino o que cada plano precisa dizer. Isso economiza horas de tela e deixa a edição mais limpa.' },
  { id: 'montagem', code: '00:00:21:08', title: 'Montagem e ritmo', text: 'Escolho os melhores takes, construo a narrativa e ajusto o ritmo para a emoção chegar no momento certo.' },
  { id: 'cor', code: '00:01:04:16', title: 'Cor, som e motion', text: 'Tratamento de cor, mixagem, motion graphics e legendas. É aqui que o vídeo ganha identidade.' },
  { id: 'entrega', code: '00:01:37:02', title: 'Entrega em todos os formatos', text: 'Versões para cinema, YouTube, Reels, TikTok e anúncios, cada uma com o corte e a legenda adequados.' },
];

// Serviços: confirme ou ajuste esta lista antes de publicar.
export const services = [
  'Edição de vídeo',
  'Captação audiovisual',
  'Motion design',
  'Direção criativa',
  'Color grading',
  'Conteúdo para redes sociais',
  'Vídeos institucionais',
];
