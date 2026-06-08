import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Documentation Center',
  tagline: 'Docs & Guides. Go from beginner to pro.',
  favicon: 'img/favicon.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.aqara.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Aqara', // Usually your GitHub org/user name.
  projectName: 'aqara-developer-docs', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    path: 'i18n',
    localeConfigs: {
      en: { label: 'English', direction: 'ltr', path: 'en', htmlLang: 'en-US' },
      zh: { label: '简体中文', direction: 'ltr', path: 'zh', htmlLang: 'zh-Hans' },
    }
  },

  // Enable Mermaid diagrams in Markdown and add the theme
  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid', 'docusaurus-theme-openapi-docs'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          docItemComponent: '@theme/ApiItem',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/aqara/aqara-developer-docs/edit/main/',
          includeCurrentVersion: false,
          versions: {
            'Beta': {
              label: 'Beta (Current)',
              // path: '/', // options
            },
          },
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },

        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  // Add local search plugin
  plugins: [
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'openapi',
        docsPluginId: 'classic',
        config: {
          dataExportApi: {
            specPath: 'openapi/data-export-api/en/data-export-api.yaml',
            outputDir:
              'versioned_docs/version-Beta/aqara-developer/data-export-api',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
              sidebarCollapsed: false,
            },
          },
          aiotApi: {
            specPath: 'openapi/aiot-api/en/aiot-api.yaml',
            outputDir:
              'versioned_docs/version-Beta/aqara-developer/aiot-api',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
              sidebarCollapsed: false,
            },
          },
          aiotApiZh: {
            specPath: 'openapi/aiot-api/zh/aiot-api.yaml',
            outputDir:
              'i18n/zh/docusaurus-plugin-content-docs/version-Beta/aqara-developer/aiot-api',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
              sidebarCollapsed: false,
            },
          },
          dataExportApiZh: {
            specPath: 'openapi/data-export-api/zh/data-export-api.yaml',
            outputDir:
              'i18n/zh/docusaurus-plugin-content-docs/version-Beta/aqara-developer/data-export-api',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
              sidebarCollapsed: false,
            },
          },
        },
      },
    ],
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en', 'zh'],
      },
    ],
  ],

  themeConfig: {

    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Aqara Docs',
      logo: {
        alt: 'Aqara Docs',
        src: 'img/logo.svg',
      },
      items: [
        {
          label: "Docs",
          position: "left",
          items: [
            { label: "Aqara Studio", to: "docs/aqara-studio/overview/introduction", activeBasePath: "docs/aqara-studio" },
            { label: "Aqara Developer", to: "docs/aqara-developer/aiot-api/get-spaces", activeBasePath: "docs/aqara-developer" },
          ],
        },

        {
          href: 'https://builder.aqara.com',
          label: 'Aqara Builder',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          type: 'search',
          position: 'left', // search to left
        },

      ],
    },
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: 'docs/aqara-studio/overview/introduction',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Developer Forum',
              href: 'https://forum.aqara.com',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/aqara',
            },
            {
              label: 'X (formerly Twitter)',
              href: 'https://x.com/AqaraSmarthome',
            },
          ],
        },
        {
          title: 'Corporate',
          items: [

            {
              label: 'Official Website',
              href: 'https://www.aqara.com',
            },
            {
              label: 'Privacy Policy',
              href: 'https://www.aqara.com/en/privacy_policy.html',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/aqara/aqara-developer-docs',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Aqara. All Rights Reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
