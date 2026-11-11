// Conteúdo centralizado. Troque textos, links e projetos aqui; o site inteiro se atualiza.

export const site = {
  brand: 'NVUP',
  name: 'NVUP',
  founder: 'Vinícius Carvalho',
  role: 'Agência & Produtora audiovisual',
  url: 'https://vinicarv.com.br/',
  email: 'vinysilva1914@gmail.com',
  instagram: 'https://www.instagram.com/viny_carv',
  instagramHandle: '@viny_carv',
  // WhatsApp: +55 11 93536-0112
  whatsapp: 'https://wa.me/5511935360112?text=Oi%2C%20vi%20o%20site%20da%20NVUP%20e%20quero%20conversar',
  whatsappLabel: '+55 11 93536-0112',
};

export const services = ['Captação', 'Edição', 'Motion', 'Color grading', 'Social media', 'Direção criativa', 'Vídeos institucionais', 'Conteúdo vertical'];

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
  embedUrl: string; // player incorporado (YouTube) para assistir dentro do site
  tone: [string, string]; // cores da capa gerada enquanto não há miniatura
};

export const projects: Project[] = [
  {
    id: 'congressos', number: '01', title: 'Congressos', category: 'Eventos', year: '2026',
    description: 'Cobertura e edição de congressos: cortes de palco, depoimentos e resumos para divulgação.',
    role: 'Edição, cor', format: '16:9', thumb: 'https://i.ytimg.com/vi/PMosUYRb1RY/hqdefault.jpg', videoUrl: '', embedUrl: 'https://www.youtube-nocookie.com/embed/PMosUYRb1RY',
    externalUrl: '',
    tone: ['#ff5a1f', '#1a0d07'],
  },
  {
    id: 'verticais', number: '02', title: 'Verticais', category: 'Conteúdo vertical', year: '2026',
    description: 'Vídeos em formato vertical para Reels, TikTok e Shorts, com ritmo e legenda pensados para o celular.',
    role: 'Edição, motion', format: '9:16', thumb: 'https://i.ytimg.com/vi/UpZKW6eflzo/hqdefault.jpg', videoUrl: '', embedUrl: 'https://www.youtube-nocookie.com/embed/UpZKW6eflzo',
    externalUrl: '',
    tone: ['#ffb07a', '#0b0b0d'],
  },
  {
    id: 'cinematograficos', number: '03', title: 'Cinematográficos', category: 'Filme', year: '2026',
    description: 'Projetos de narrativa com tratamento de cor de cinema, enquadramento e trilha pensados para a tela grande.',
    role: 'Direção, edição, color grading', format: '16:9', thumb: 'https://i.ytimg.com/vi/MNk7pxCb4uU/hqdefault.jpg', videoUrl: '', embedUrl: 'https://www.youtube-nocookie.com/embed/MNk7pxCb4uU',
    externalUrl: '',
    tone: ['#c2410c', '#151517'],
  },
  {
    id: 'virais', number: '04', title: 'Virais', category: 'Redes sociais', year: '2026',
    description: 'Vídeos curtos feitos para prender a atenção nos primeiros segundos e gerar compartilhamento.',
    role: 'Edição, legenda', format: '9:16', thumb: 'https://i.ytimg.com/vi/nhQsCnaUpi8/hqdefault.jpg', videoUrl: '', embedUrl: 'https://www.youtube-nocookie.com/embed/nhQsCnaUpi8',
    externalUrl: '',
    tone: ['#ff7a35', '#222225'],
  },
];

export const steps = [
  { n: '01', title: 'Captar', text: 'Vamos até você. Câmera, luz e roteiro já pensados para o feed.' },
  { n: '02', title: 'Editar', text: 'Corte, cor, som e legenda. Os 3 primeiros segundos recebem atenção dobrada.' },
  { n: '03', title: 'Postar', text: 'Calendário fixo toda semana. Você aprova, a gente publica.' },
  { n: '04', title: 'Medir', text: 'Olhamos o que funcionou e ajustamos o próximo mês.' },
];

export const faq = [
  { q: 'O que está incluso?', a: 'Captação, edição e postagem, num pacote mensal fixo. Sem surpresa na fatura.' },
  { q: 'Quantos posts por semana?', a: 'Definimos juntos. O ponto de partida é 3 posts por semana, toda semana.' },
  { q: 'Eventos da empresa entram no pacote?', a: 'Registros rápidos de eventos entram no pacote, sem custo extra.' },
  { q: 'Já tenho o material. Vocês só editam?', a: 'Editamos, sim. Você manda o bruto e recebe pronto em todos os formatos.' },
];
