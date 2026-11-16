import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const require = createRequire(import.meta.url);
const {PRODUCT_CONFIG} = require('../plugins/llms-generator/generator.cjs');

export async function checkDocNavigation(root) {
  let checks = 0;
  const equal = (actual, expected) => { assert.deepEqual(actual, expected); checks += 1; };
  const ok = (condition, message) => { assert.ok(condition, message); checks += 1; };
  const plain = value => JSON.parse(JSON.stringify(value));
  const loadModule = async (path, globals = {}) => {
    const source = await readFile(resolve(root, path), 'utf8');
    const {outputText, diagnostics} = ts.transpileModule(source, {
      fileName: path, reportDiagnostics: true,
      compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React},
    });
    equal(diagnostics.filter(item => item.category === ts.DiagnosticCategory.Error).length, 0);
    const exports = {};
    new vm.Script(outputText, {filename: path}).runInNewContext({exports, URL, ...globals}, {timeout: 500});
    return exports;
  };
  const {resolveScriptAnchor} = await loadModule('src/components/ProtocolScriptRedirect/anchors.ts');
  const {llmsMatchesLocale, formatLlmsForSite} = await loadModule('src/components/DocLLMActions/llms.ts');
  const transports = {
    'tcp-udp': {name: 'udp-tcp', anchors: ['messages', 'discovery', 'framing', 'example', 'debugging']},
    http: {name: 'http', anchors: ['messages', 'discovery-and-report', 'example', 'debugging']},
    mqtt: {name: 'mqtt', anchors: ['discovery', 'messages', 'commands', 'example', 'debugging']},
  };
  const locales = {
    en: 'versioned_docs/version-Beta/aqara-studio',
    zh: 'i18n/zh/docusaurus-plugin-content-docs/version-Beta/aqara-studio',
  };

  // 旧地址只承担跳转与无 JS 的回退入口，完整规范只保留一份。
  for (const [locale, directory] of Object.entries(locales)) {
    const spec = await readFile(resolve(root, directory, 'unified-protocol-script.mdx'), 'utf8');
    const guide = await readFile(resolve(root, directory, 'ai-agent-device-onboarding.mdx'), 'utf8');
    const ids = [...spec.matchAll(/\{#([^}]+)\}/g)].map(match => match[1]);
    equal(ids.length, new Set(ids).size);
    equal((spec.match(/^## /gm) || []).length, 4);
    equal((spec.match(/^<details>$/gm) || []).length, 3);
    equal((spec.match(/^<\/details>$/gm) || []).length, 3);
    for (const id of ['prerequisites', 'discover-environment', 'generate', 'validate-and-upload',
      'configure-network', 'discovery', 'read-and-probe', 'control', 'iterate', 'acceptance']) {
      ok(guide.includes(`id="${id}"`), `Old guide anchor missing: ${locale}/${id}`);
    }
    for (const [transport, {name, anchors}] of Object.entries(transports)) {
      const legacy = await readFile(resolve(root, directory, `javascript-for-${name}-integration.mdx`), 'utf8');
      ok(legacy.includes('unlisted: true'), 'Legacy redirect should stay out of search and indexes');
      const redirect = legacy.match(/<ProtocolScriptRedirect\s+transport="([^"]+)"\s+href="([^"]+)"/);
      ok(redirect && redirect[1] === transport, 'Wrong redirect chapter');
      // 中文既可能挂载在 /zh/，也可能作为单语言构建挂载在根路径；跳转必须保持当前挂载点。
      for (const prefix of locale === 'zh' ? ['', '/zh'] : ['']) {
        const page = `https://docs-preview.aqara.com${prefix}/docs/aqara-studio/javascript-for-${name}-integration`;
        equal(new URL(`${redirect[2]}#${transport}`, page).href,
          `https://docs-preview.aqara.com${prefix}/docs/aqara-studio/unified-protocol-script#${transport}`);
      }
      ok(ids.includes(transport), `Missing transport chapter ${transport}`);
      for (const anchor of anchors) {
        const target = `${transport}-${anchor}`;
        equal(resolveScriptAnchor(transport, `#${anchor}`), target);
        equal(resolveScriptAnchor(transport, `#${encodeURIComponent(anchor)}`), target);
        ok(ids.includes(target), `Missing merged anchor ${target}`);
      }
    }
  }
  for (const transport of Object.keys(transports)) {
    for (const hash of ['', '#unknown', '#%ZZ', '#__proto__', '#constructor', '#https://evil.example']) {
      equal(resolveScriptAnchor(transport, hash), transport);
    }
  }
  equal(resolveScriptAnchor('http', '#%65xample'), 'http-example');

  // 验证服务端回退和浏览器 replace，避免后退按钮反复落到旧页。
  const effects = [];
  const replacements = [];
  const react = {useEffect: callback => effects.push(callback), createElement: (tag, props, ...children) => ({tag, props, children})};
  const {default: Redirect} = await loadModule('src/components/ProtocolScriptRedirect/index.tsx', {
    require: name => name === 'react' ? {...react, default: react} : name === './anchors' ? {resolveScriptAnchor} : {default: 'Link'},
    window: {location: {hash: '#example', replace: href => replacements.push(href)}},
  });
  const fallback = Redirect({transport: 'mqtt', href: '/zh/docs/aqara-studio/unified-protocol-script', children: 'MQTT'});
  equal(replacements, []);
  equal(plain(fallback.children[0].props), {to: '/zh/docs/aqara-studio/unified-protocol-script#mqtt'});
  effects[0]();
  equal(replacements, ['/zh/docs/aqara-studio/unified-protocol-script#mqtt-example']);

  // MDX 会把块级子文本包装为段落，外层不能再返回 p，否则浏览器重排会破坏水合。
  const {default: SsrRedirect} = await loadModule('src/components/ProtocolScriptRedirect/index.tsx', {
    require: name => name === 'react' ? {...React, default: React} : name === './anchors'
      ? {resolveScriptAnchor} : {default: ({to, children}) => React.createElement('a', {href: to}, children)},
  });
  const ssr = renderToStaticMarkup(React.createElement(SsrRedirect, {
    transport: 'mqtt', href: '/docs/aqara-studio/unified-protocol-script',
  }, React.createElement('p', null, 'MQTT')));
  equal(ssr, '<div><a href="/docs/aqara-studio/unified-protocol-script#mqtt"><p>MQTT</p></a></div>');

  const sites = ['https://docs.aqara.com', 'https://docs-preview.aqara.com', 'http://localhost:3000'];
  for (const site of sites) {
    for (const locale of ['en', 'zh']) {
      const prefix = locale === 'zh' ? '/zh' : '';
      const relative = `# Index\n- Guide: ${prefix}/docs/aqara-studio/ai-agent-device-onboarding#workflow\n- Index: ${prefix}/aqara-studio/llms.txt\n`;
      equal(llmsMatchesLocale(relative, locale, site), true);
      equal(llmsMatchesLocale(relative.replaceAll('\n', '\r\n'), locale, site), true);
      equal(llmsMatchesLocale(relative, locale === 'zh' ? 'en' : 'zh', site), false);
      const absolute = relative.replace(/: (\/\S+)/g, `: ${site}$1`);
      equal(formatLlmsForSite(relative, site), absolute);
      equal(formatLlmsForSite(relative.replaceAll('\n', '\r\n'), site), absolute.replaceAll('\n', '\r\n'));
      for (const previous of ['https://docs.aqara.com', 'https://docs-preview.aqara.com']) {
        const cached = relative.replace(/: (\/\S+)/g, `: ${previous}$1`);
        equal(llmsMatchesLocale(cached, locale, site), true);
        equal(formatLlmsForSite(cached, site), absolute);
      }
      equal(formatLlmsForSite(absolute, site), absolute);
    }
    for (const invalid of [
      '<!doctype html><title>Aqara Docs</title>', '# Empty',
      '- Guide: javascript:alert(1)', '- Guide: https://docs.aqara.com.evil.example/docs/studio',
      '- Guide: https://docs.aqara.com@evil.example/docs/studio',
      '- Guide: https://user:password@docs.aqara.com/docs/studio',
    ]) {
      equal(llmsMatchesLocale(invalid, 'en', site), false);
      equal(formatLlmsForSite(invalid, site), invalid);
    }
    equal(llmsMatchesLocale('- EN: /docs/studio\n- ZH: /zh/docs/studio', 'en', site), false);
    equal(llmsMatchesLocale('- EN: /docs/studio\n- ZH: /zh/docs/studio', 'zh', site), false);
    const external = '- Vendor: https://vendor.example/docs/api\n- Link: //outside.example/llms.txt';
    equal(formatLlmsForSite(external, site), external);
  }

  // 原先固定正式域名的校验拒绝相对索引；旧复制结果会把测试环境读者导向正式环境。
  const relative = '- Guide: /zh/docs/aqara-studio/ai-agent-device-onboarding';
  equal(/https:\/\/docs\.aqara\.com\/zh\/docs\//.test(relative), false);
  equal(llmsMatchesLocale(relative, 'zh', sites[1]), true);
  const cached = '- Guide: https://docs.aqara.com/zh/docs/aqara-studio/ai-agent-device-onboarding';
  ok(cached !== formatLlmsForSite(cached, sites[1]), 'Cached production links must be rebased on preview');

  for (const locale of ['en', 'zh']) {
    const prefix = locale === 'zh' ? 'zh/' : '';
    for (const product of [null, ...PRODUCT_CONFIG]) {
      const path = `static/${prefix}${product ? `${product.slug}/` : ''}llms.txt`;
      const content = await readFile(resolve(root, path), 'utf8');
      const links = [...content.matchAll(/^- .+:[ \t]+(\S+)/gm)].map(match => match[1]);
      ok(links.length > 0 && links.every(href => href.startsWith('/') && !href.startsWith('//')), `Nonportable links in ${path}`);
      equal(llmsMatchesLocale(content, locale, sites[1]), true);
      const copied = formatLlmsForSite(content, sites[1]);
      ok(!copied.includes('https://docs.aqara.com'), 'Copy must not hardcode production');
      ok(!content.includes('javascript-for-'), 'Merged references should not be indexed');
      if (product?.slug === 'aqara-studio') {
        for (const name of ['ai-agent-device-onboarding', 'unified-protocol-script', 'protocol-script-mcp-api']) {
          ok(content.includes(`/docs/aqara-studio/${name}`), `Missing primary script document ${name}`);
        }
      }
    }
  }
  console.log(`Navigation, redirects and deployment-independent llms regressions passed: ${checks}.`);
  return checks;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await checkDocNavigation(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
}
