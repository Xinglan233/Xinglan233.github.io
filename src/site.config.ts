import type { Config, IntegrationUserConfig, ThemeUserConfig } from 'astro-pure/types'

export const theme: ThemeUserConfig = {
  title: 'Xinglan233',
  author: 'Xinglan233',
  description: '记录、思考与日常。',
  favicon: '/favicon.svg',
  socialCard: '/social-card.png',
  locale: {
    lang: 'zh-CN',
    attrs: 'zh_CN',
    dateLocale: 'zh-CN',
    dateOptions: { year: 'numeric', month: 'long', day: 'numeric' }
  },
  logo: { src: '/favicon.svg', alt: 'Xinglan233' },
  titleDelimiter: '·',
  prerender: true,
  npmCDN: 'https://cdn.jsdelivr.net/npm',
  head: [],
  customCss: [],
  header: {
    menu: [
      { title: '文章', link: '/blog' },
      { title: '归档', link: '/archives' },
      { title: '关于', link: '/about' }
    ]
  },
  footer: {
    year: `© ${new Date().getFullYear()} `,
    links: [],
    credits: true,
    social: [
      { icon: 'github', label: 'GitHub', href: 'https://github.com/Xinglan233' },
      { icon: 'rss', label: 'RSS 订阅', href: '/rss.xml' }
    ]
  },
  content: {
    externalLinks: { content: ' ↗', properties: { style: 'user-select:none' } },
    blogPageSize: 8,
    share: []
  }
}

export const integ: IntegrationUserConfig = {
  links: { logbook: [], applyTip: [], cacheAvatar: false },
  pagefind: true,
  // No quote component is mounted. These empty values make no network request.
  quote: { server: '', target: '' },
  typography: {
    class: 'prose text-base',
    blockquoteStyle: 'normal',
    inlineCodeBlockStyle: 'modern'
  },
  mediumZoom: { enable: false, selector: '.prose .zoomable', options: {} },
  waline: { enable: false, showMeta: false, additionalConfigs: {} }
}

export default { ...theme, integ } as Config
