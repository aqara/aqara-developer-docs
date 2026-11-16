import React, {type ReactNode, useEffect, useState} from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import {createPortal} from 'react-dom';
import {formatLlmsForSite, llmsMatchesLocale} from './llms';
import styles from './index.module.css';

type Locale = 'en' | 'zh';

const UI_TEXT = {
  en: {
    copy: 'Copy Page as Markdown',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    copyLlms: 'Copy llms.txt',
    copyLlmsDone: 'llms.txt copied',
    copyLlmsFailed: 'llms.txt copy failed',
  },
  zh: {
    copy: '以 Markdown 格式复制',
    copied: '已复制',
    copyFailed: '复制失败',
    copyLlms: '复制 llms.txt',
    copyLlmsDone: '已复制 llms.txt',
    copyLlmsFailed: '复制 llms.txt 失败',
  },
};

function CopyIcon(): ReactNode {
  return (
    <svg aria-hidden="true" height="16" viewBox="0 0 24 24" width="16">
      <path
        d="M9 9.75A2.25 2.25 0 0 1 11.25 7.5h7.5A2.25 2.25 0 0 1 21 9.75v9a2.25 2.25 0 0 1-2.25 2.25h-7.5A2.25 2.25 0 0 1 9 18.75z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M6.75 16.5A2.25 2.25 0 0 1 4.5 14.25v-9A2.25 2.25 0 0 1 6.75 3h7.5A2.25 2.25 0 0 1 16.5 5.25"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function normalizeWhitespace(value: string): string {
  return value.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function extractText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? '';
  }

  if (!(node instanceof HTMLElement)) {
    return '';
  }

  if (
    node.classList.contains('aqara-llm-actions') ||
    node.closest('.aqara-llm-actions')
  ) {
    return '';
  }

  const tagName = node.tagName.toLowerCase();
  const childText = Array.from(node.childNodes).map(extractText).join('');

  if (/^h[1-6]$/u.test(tagName)) {
    const level = Number(tagName.charAt(1));
    return `${'#'.repeat(level)} ${normalizeWhitespace(childText)}\n\n`;
  }

  if (tagName === 'p') {
    return `${normalizeWhitespace(childText)}\n\n`;
  }

  if (tagName === 'pre') {
    const codeBlock = node.querySelector('code');
    const rawCode = codeBlock?.textContent ?? node.textContent ?? '';
    const languageClass = Array.from(codeBlock?.classList ?? []).find((className) =>
      className.startsWith('language-'),
    );
    const language = languageClass?.replace('language-', '') ?? '';
    return `\`\`\`${language}\n${rawCode.trim()}\n\`\`\`\n\n`;
  }

  if (tagName === 'code') {
    if (node.parentElement?.tagName.toLowerCase() === 'pre') {
      return '';
    }
    return `\`${normalizeWhitespace(childText)}\``;
  }

  if (tagName === 'a') {
    const href = (node as HTMLAnchorElement).href || '';
    const text = normalizeWhitespace(childText) || href;
    return href ? `[${text}](${href})` : text;
  }

  if (tagName === 'strong' || tagName === 'b') {
    return `**${normalizeWhitespace(childText)}**`;
  }

  if (tagName === 'em' || tagName === 'i') {
    return `*${normalizeWhitespace(childText)}*`;
  }

  if (tagName === 'blockquote') {
    const quoted = normalizeWhitespace(childText)
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n');
    return `${quoted}\n\n`;
  }

  if (tagName === 'ul') {
    const items = Array.from(node.children)
      .filter((child) => child.tagName.toLowerCase() === 'li')
      .map((item) => `- ${normalizeWhitespace(extractText(item))}`);
    return `${items.join('\n')}\n\n`;
  }

  if (tagName === 'ol') {
    const items = Array.from(node.children)
      .filter((child) => child.tagName.toLowerCase() === 'li')
      .map(
        (item, index) => `${index + 1}. ${normalizeWhitespace(extractText(item))}`,
      );
    return `${items.join('\n')}\n\n`;
  }

  if (tagName === 'table') {
    const rows = Array.from(node.querySelectorAll('tr')).map((row) =>
      Array.from(row.children).map((cell) => normalizeWhitespace(cell.textContent || '')),
    );

    if (rows.length === 0) {
      return '';
    }

    const [headerRow, ...bodyRows] = rows;
    const header = `| ${headerRow.join(' | ')} |`;
    const divider = `| ${headerRow.map(() => '---').join(' | ')} |`;
    const body = bodyRows.map((row) => `| ${row.join(' | ')} |`).join('\n');
    return `${[header, divider, body].filter(Boolean).join('\n')}\n\n`;
  }

  if (tagName === 'hr') {
    return `---\n\n`;
  }

  if (tagName === 'br') {
    return '\n';
  }

  if (tagName === 'li') {
    return normalizeWhitespace(childText);
  }

  if (tagName === 'img') {
    const alt = node.getAttribute('alt') || 'image';
    const src = node.getAttribute('src') || '';
    return src ? `![${alt}](${src})` : '';
  }

  return childText;
}

function getMarkdownFromPage(): string {
  const root =
    document.querySelector('article .theme-api-markdown .openapi-left-panel__container') ||
    document.querySelector('article .theme-doc-markdown');

  if (!(root instanceof HTMLElement)) {
    return '';
  }

  return normalizeWhitespace(extractText(root));
}

function currentLocale(permalink: string): Locale {
  return permalink.startsWith('/zh/') ? 'zh' : 'en';
}

function currentProductSlug(docId: string): string | null {
  const [slug] = docId.split('/');
  return slug || null;
}

function productLlmsCandidates(locale: Locale, slug: string): string[] {
  if (locale === 'zh') {
    return [`/zh/${slug}/llms.txt`, `/zh/zh/${slug}/llms.txt`];
  }

  return [`/${slug}/llms.txt`];
}

async function fetchLocalizedProductLlms(
  locale: Locale,
  slug: string,
): Promise<string> {
  const candidates = productLlmsCandidates(locale, slug);

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate);
      if (!response.ok) {
        continue;
      }

      const content = await response.text();
      if (content.trim() && llmsMatchesLocale(content, locale, window.location.origin)) {
        return formatLlmsForSite(content, window.location.origin);
      }
    } catch {
      continue;
    }
  }

  throw new Error('Failed to resolve localized llms.txt');
}

function shouldHideForSource(source: string | undefined): boolean {
  if (!source) {
    return false;
  }

  const hiddenExactSources = [
    '@site/versioned_docs/version-Beta/aqara-developer/data-export-api/websocket-api/index.mdx',
    '@site/i18n/zh/docusaurus-plugin-content-docs/version-Beta/aqara-developer/data-export-api/websocket-api/index.mdx',
  ];

  if (hiddenExactSources.includes(source)) {
    return true;
  }

  if (!source.endsWith('.api.mdx')) {
    return false;
  }

  return (
    source.includes('@site/versioned_docs/version-Beta/aqara-developer/') ||
    source.includes(
      '@site/i18n/zh/docusaurus-plugin-content-docs/version-Beta/aqara-developer/',
    )
  );
}

export default function DocLLMActions(): ReactNode {
  const {metadata} = useDoc();
  const locale = currentLocale(metadata.permalink);
  const productSlug = currentProductSlug(metadata.id);
  const text = UI_TEXT[locale];
  const shouldHide = shouldHideForSource(metadata.source);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [pageStatus, setPageStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [llmsStatus, setLlmsStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    if (shouldHide) {
      setTarget(null);
      return undefined;
    }

    const heading = document.querySelector(
      'article .theme-doc-markdown h1, article .openapi__heading, article h1',
    );

    if (!(heading instanceof HTMLElement)) {
      setTarget(null);
      return undefined;
    }

    let anchor: HTMLElement | null =
      heading.nextElementSibling instanceof HTMLElement
        ? heading.nextElementSibling
        : null;
    if (
      !anchor ||
      !anchor.classList.contains('aqara-llm-actions-anchor')
    ) {
      anchor = document.createElement('div');
      anchor.className = 'aqara-llm-actions-anchor';
      heading.insertAdjacentElement('afterend', anchor);
    }

    setTarget(anchor);

    return () => {
      setTarget(null);
      if (anchor?.isConnected) {
        anchor.remove();
      }
    };
  }, [metadata.permalink, shouldHide]);

  async function handleCopyClick() {
    try {
      const markdown = getMarkdownFromPage();
      if (!markdown) {
        throw new Error('No page content available');
      }
      await navigator.clipboard.writeText(markdown);
      setPageStatus('copied');
      window.setTimeout(() => setPageStatus('idle'), 1800);
    } catch {
      setPageStatus('error');
      window.setTimeout(() => setPageStatus('idle'), 2200);
    }
  }

  async function handleCopyLlmsClick() {
    if (!productSlug) {
      return;
    }

    try {
      const content = await fetchLocalizedProductLlms(locale, productSlug);
      await navigator.clipboard.writeText(content);
      setLlmsStatus('copied');
      window.setTimeout(() => setLlmsStatus('idle'), 1800);
    } catch {
      setLlmsStatus('error');
      window.setTimeout(() => setLlmsStatus('idle'), 2200);
    }
  }

  if (shouldHide || !target) {
    return null;
  }

  const pageLabel =
    pageStatus === 'copied'
      ? text.copied
      : pageStatus === 'error'
        ? text.copyFailed
        : text.copy;

  const llmsLabel =
    llmsStatus === 'copied'
      ? text.copyLlmsDone
      : llmsStatus === 'error'
        ? text.copyLlmsFailed
        : text.copyLlms;

  return createPortal(
    <div className={`${styles.actions} aqara-llm-actions`}>
      <button className={styles.button} onClick={handleCopyClick} type="button">
        <span className={styles.icon}>
          <CopyIcon />
        </span>
        <span>{pageLabel}</span>
      </button>
      {productSlug ? (
        <button className={styles.button} onClick={handleCopyLlmsClick} type="button">
          <span className={styles.icon}>
            <CopyIcon />
          </span>
          <span>{llmsLabel}</span>
        </button>
      ) : null}
    </div>,
    target,
  );
}
