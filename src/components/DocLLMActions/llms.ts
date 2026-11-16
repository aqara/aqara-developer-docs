type Locale = 'en' | 'zh';

const SITE_ORIGINS = new Set(['https://docs.aqara.com', 'https://docs-preview.aqara.com']);
const ENTRY = /^(- .+:[ \t]+)(\S+)([ \t]*)$/gm;

function siteLink(href: string, site: URL): URL | null {
  try {
    const url = new URL(href, site);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    if (url.origin !== site.origin && !SITE_ORIGINS.has(url.origin)) return null;
    return url;
  } catch {
    return null;
  }
}

export function llmsMatchesLocale(content: string, locale: Locale, siteUrl: string): boolean {
  const site = new URL(siteUrl);
  const links = [...content.matchAll(ENTRY)]
    .map(match => siteLink(match[2], site))
    .filter((url): url is URL => !!url && /^\/(?:zh\/)?docs\//.test(url.pathname));
  return links.length > 0 && links.every(url => locale === 'zh'
    ? url.pathname.startsWith('/zh/docs/') : url.pathname.startsWith('/docs/'));
}

export function formatLlmsForSite(content: string, siteUrl: string): string {
  const site = new URL(siteUrl);
  // 静态索引使用相对地址；复制时补齐当前域名，并兼容缓存中的旧生产地址。
  return content.replace(ENTRY, (line, prefix: string, href: string, suffix: string) => {
    const url = siteLink(href, site);
    if (!url || !(/^\/(?:zh\/)?docs\//.test(url.pathname) || url.pathname.endsWith('/llms.txt'))) return line;
    return `${prefix}${new URL(`${url.pathname}${url.search}${url.hash}`, site.origin).href}${suffix}`;
  });
}
