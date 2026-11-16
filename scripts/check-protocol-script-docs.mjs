import assert from 'node:assert/strict';
import {readFile, access, writeFile} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {compile} from '@mdx-js/mdx';
import {createRequire} from 'node:module';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import {checkDocNavigation} from './check-doc-navigation.mjs';

const require = createRequire(import.meta.url);
const {default: remarkHeadings} = require('@docusaurus/mdx-loader/lib/remark/headings/index.js');
const {escapeMarkdownHeadingIds} = require('@docusaurus/utils');

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const names = [
  'unified-protocol-script', 'javascript-for-udp-tcp-integration',
  'javascript-for-http-integration', 'javascript-for-mqtt-integration',
  'ai-agent-device-onboarding', 'protocol-script-mcp-api',
];
const scriptKinds = ['skeleton', 'tcp-udp', 'http', 'mqtt'];
const locales = {
  en: 'versioned_docs/version-Beta/aqara-studio',
  zh: 'i18n/zh/docusaurus-plugin-content-docs/version-Beta/aqara-studio',
};
let checks = 0;
const examples = new Map();
const documents = new Map();
const graalCases = [];
function equal(actual, expected) { assert.deepEqual(actual, expected); checks += 1; }
function ok(value, message) { assert.ok(value, message); checks += 1; }
const plain = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value,
  (_, item) => ArrayBuffer.isView(item) ? Array.from(item) : item));
const jsonBlocks = text => [...text.matchAll(/^```json[^\r\n]*\r?\n([\s\S]*?)^```\s*$/gm)]
  .map(match => JSON.parse(match[1]));

const specConceptsLink = '../aqara-developer/aqara-data-model-specification/aqara-data-model-tags.mdx';
function checkSpecConceptLinks(text) {
  for (const field of ['`devType` / `functionCode` / `traitCode`', '`commandCode`']) {
    const row = text.split(/\r?\n/).find(line => line.startsWith(`| ${field} |`));
    assert.ok(row, `Missing point definition row: ${field}`);
    assert.deepEqual([...row.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]), [specConceptsLink],
      `Point definition must link to the relative data-model source: ${field}`);
  }
  return 4;
}

function checkPublishedSpecConcepts(text) {
  // 草稿在开发预览中可见，但不会出现在正式构建中，引用必须指向可发布的页面。
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  assert.doesNotMatch(frontmatter, /^draft:\s*true\s*$/m, 'Spec reference must not be a draft');
  return 1;
}

function checkFirstUploadPaths(text) {
  for (const term of ['`data.networkBeanId`', '`data.scripts`', '`[A-Za-z0-9._-]`']) {
    assert.ok(text.includes(term), `Missing first-upload namespace rule: ${term}`);
  }
  assert.match(text, /首尾的 `_`|leading\/trailing `_`/);
  const rows = [...text.matchAll(/^\| `([^`\r\n]+)` \| `([^`\r\n]+)` \| `(file:%\/protocol-scripts\/[^`\r\n]+)` \|\r?$/gm)];
  assert.deepEqual(rows.map(row => row[1]).sort(),
    ['tcp:TcpNetwork', 'udp:UdpNetwork', 'http:HttpNetwork', 'mqtt:MqttConnNetwork'].sort());
  for (const [, beanId, namespace, path] of rows) {
    const normalized = beanId.trim().replace(/[^A-Za-z0-9._-]/g, '_').replace(/^_+|_+$/g, '');
    assert.equal(namespace, normalized, `Wrong documented namespace for ${beanId}`);
    assert.equal(path, `file:%/protocol-scripts/${normalized}/vendor.js`, `Wrong first-upload path for ${beanId}`);
  }
  return 5 + rows.length * 2;
}

function checkGenerationTemplate(text) {
  const template = text.match(/^## 11\. .*?\r?\n([\s\S]*?)(?=^## 12\.)/m)?.[1];
  assert.ok(template, 'Missing reusable generation template');
  assert.ok(template.includes('describe().configSchema.network/device'), 'JS declaration path must remain configSchema');
  assert.match(template, /resource_read[^\r\n]*data\.schema/, 'Template must read the public instance schema');
  assert.doesNotMatch(template, /data\.configSchema|回读实例\s+configSchema/, 'Template uses the internal schema name');
  return 4;
}

function checkMqttIdentityCompatibility(text, locale) {
  for (const term of ['`deviceId`', '`getDeviceUuid()`', '`clientId`']) {
    assert.ok(text.includes(term), `Missing MQTT identity term: ${term}`);
  }
  const rules = locale === 'zh' ? [
    /非空白(?:的业务|业务) `deviceId` 原样传递/,
    /空字符串或纯空白时回退到 `getDeviceUuid\(\)`/,
    /不修改已保存的 deviceId\/clientId/,
    /新发现设备仍必须提供非空白 deviceId/,
  ] : [
    /nonblank business `deviceId` is passed unchanged/,
    /empty or whitespace-only ID falls back to `getDeviceUuid\(\)`/,
    /does not modify persisted deviceId\/clientId/,
    /Newly discovered devices must still provide a nonblank deviceId/,
  ];
  for (const rule of rules) assert.match(text, rule);
  return 3 + rules.length;
}

function checkTcpConnectionDocs(text) {
  const start = text.indexOf('{#tcp-connection}');
  const end = text.indexOf('{#tcp-udp-framing}', start);
  assert.ok(start >= 0 && end > start, 'Missing TCP connection lifecycle section');
  const section = text.slice(start, end);
  for (const [field, defaultValue] of [
    ['initializeWithProbe', 'false'], ['heartbeatIntervalMillis', '0'],
    ['failureGraceMillis', '0'], ['gracefulClose', 'false'],
  ]) {
    assert.ok(section.includes(`| \`${field}\` | \`${defaultValue}\` |`),
      `Missing TCP connection field/default: ${field}`);
  }
  const fragments = jsonBlocks(section);
  assert.deepEqual(fragments, [{protocol: {connection: {
    initializeWithProbe: true, heartbeatIntervalMillis: 30000,
    failureGraceMillis: 180000, gracefulClose: true,
  }}, framing: {delimiterBytes: [10]}}]);
  for (const term of ['ConnectorCore', 'Script', 'TCP', 'connectionId', '86,400,000', '3,600,000',
    'framing.frameStartBytes is required', 'decode() returned an unknown operation', 'HOPE V1.3.0']) {
    assert.ok(section.includes(term), `Missing connection or compatibility rule: ${term}`);
  }
  const operation = text.split(/\r?\n/).find(line => line.startsWith('| `operation` |'));
  assert.ok(operation?.includes('`disconnect`'), 'Input operations omit TCP disconnect');
  assert.ok(text.includes('| `connectionId` |') && text.includes('| `disconnect` |'),
    'Unified inputs/results omit TCP connection extensions');
  const framing = text.slice(end, text.indexOf('{#tcp-udp-example}', end));
  assert.ok(framing.includes('delimiterBytes') && framing.includes('16'), 'Missing bounded TCP delimiter mode');
  assert.doesNotMatch(framing, /There are no delimiter/, 'Framing section retains the obsolete delimiter denial');
  return 19;
}

// 这里只检查文档示例，不替代 Studio 的 GraalJS 校验或实机通信。
function call(context, entry, input) {
  context.__docInput = structuredClone(input);
  let value = plain(new vm.Script(`${entry}(__docInput)`).runInContext(context, {timeout: 500}));
  if (entry === 'decode' && value.operation !== 'ignore' && !value.operation) {
    value = {...value, operation: input.operation};
  }
  return value;
}

for (const [locale, directory] of Object.entries(locales)) {
  for (const name of names) {
    const path = resolve(root, directory, `${name}.mdx`);
    const text = await readFile(path, 'utf8');
    documents.set(`${locale}/${name}`, text);
    ok(!/核对日期|必读与版本|Implementation basis|checked on \*\*\d{4}|Checked \*\*\d{4}/.test(text),
      `Internal review annotations in ${locale}/${name}`);
    await compile({value: escapeMarkdownHeadingIds(text), path}, {remarkPlugins: [
      remarkFrontmatter, [remarkHeadings, {anchorsMaintainCase: false}], remarkGfm,
    ]});
    checks += 1;
    for (const block of text.matchAll(/^```json[^\r\n]*\r?\n([\s\S]*?)^```\s*$/gm)) {
      JSON.parse(block[1]);
      checks += 1;
    }
    for (const link of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      const target = link[1].split('#')[0];
      if (target.startsWith('.') && /\.(mdx|md)$/.test(target)) {
        await access(resolve(dirname(path), target));
        checks += 1;
      }
    }
    const scripts = [...text.matchAll(/^```javascript[^\r\n]*\r?\n([\s\S]*?)^```\s*$/gm)]
      .map(match => match[1]);
    examples.set(`${locale}/${name}`, scripts);
    if (name === 'unified-protocol-script') {
      equal(scripts.length, scriptKinds.length);
      checks += checkTcpConnectionDocs(text);
      for (const missing of ['initializeWithProbe', 'connectionId', 'framing.frameStartBytes is required']) {
        assert.throws(() => checkTcpConnectionDocs(text.replaceAll(missing, 'removed-rule')));
        checks += 1;
      }
      checks += checkMqttIdentityCompatibility(text, locale);
      assert.throws(() => checkMqttIdentityCompatibility(text.replace(
        locale === 'zh' ? '空字符串或纯空白时回退到' : 'empty or whitespace-only ID falls back to',
        'identity-rule-removed'), locale));
      checks += 1;
    }
    else equal(scripts.length, 0);
    for (const [index, source] of scripts.entries()) {
      const kind = scriptKinds[index];
      const context = vm.createContext({});
      new vm.Script(source, {filename: path}).runInContext(context, {timeout: 500});
      equal(typeof context.describe, 'function');
      equal(typeof context.encode, 'function');
      equal(typeof context.decode, 'function');
      equal(plain(context.describe()).contractVersion, 1);
      const fixtures = [];
      const invoke = (entry, input) => {
        const expected = call(context, entry, input);
        fixtures.push({entry, input, expected});
        return expected;
      };
      if (kind === 'skeleton') {
        equal(invoke('encode', {operation: 'read'}), null);
        equal(invoke('decode', {operation: 'discoverDevices'}), {operation: 'discoverDevices', devices: []});
      } else if (kind === 'tcp-udp') {
        equal(invoke('encode', {transport: 'tcp', operation: 'write', deviceId: 'demo-1', pointId: 'volume', value: 20}),
          {bytes: [170, 17, 1, 20, 85]});
        equal(invoke('decode', {transport: 'tcp', deviceId: 'demo-1', bytes: [170, 144, 1, 20, 85]}),
          {operation: 'read', deviceId: 'demo-1', points: [{pointId: 'volume', value: 20}]});
        equal(invoke('decode', {transport: 'udp', deviceId: 'demo-1', bytes: [170, 145, 1, 1, 85]}),
          {operation: 'write', deviceId: 'demo-1', code: 1});
        equal(invoke('decode', {transport: 'tcp', deviceId: 'demo-1', bytes: [170, 144, 2, 20, 85]}), {operation: 'ignore'});
        assert.throws(() => invoke('encode', {operation: 'write', deviceId: 'demo-1', pointId: 'volume', value: 20.5}));
        checks += 1;
      } else if (kind === 'http') {
        equal(invoke('decode', {transport: 'http', operation: 'read', deviceId: 'demo-1', pointId: 'power', body: '{"value":false}'}),
          {operation: 'read', points: [{pointId: 'power', value: false}]});
        equal(invoke('decode', {transport: 'http', operation: 'write', deviceId: 'demo-1', body: '{"ok":false}'}),
          {operation: 'write', code: 1});
        equal(invoke('decode', {transport: 'http', operation: 'read', deviceId: 'demo-1', pointId: 'power', body: '{}'}),
          {operation: 'read', code: 1, points: [], errorMsg: 'Missing power value'});
        equal(invoke('decode', {transport: 'http', operation: 'report', body: '{"deviceId":"other","value":true}'}), {operation: 'ignore'});
        const blocks = [...text.matchAll(/^```json[^\r\n]*\r?\n([\s\S]*?)^```\s*$/gm)];
        const fixtures = blocks.map(match => JSON.parse(match[1])).find(Array.isArray);
        ok(fixtures?.length === 2, 'HTTP fixtures must exist');
        for (const fixture of fixtures) equal(invoke(fixture.entry, fixture.input), fixture.expected);
      } else if (kind === 'mqtt') {
        const discovery = invoke('decode', {transport: 'mqtt', operation: 'discoverDevices'}).devices[0];
        equal(discovery.deviceId, 'demo-1');
        ok(discovery.clientId !== discovery.deviceId, 'MQTT example must distinguish connection and business identity');
        equal(invoke('encode', {transport: 'mqtt', operation: 'read', deviceId: 'demo-1', pointId: 'volume'}),
          {body: '{"get":"volume"}', topic: 'vendor/demo-1/get', retained: false});
        equal(invoke('encode', {transport: 'mqtt', operation: 'write', deviceId: 'demo-1', pointId: 'volume', value: 20}),
          {body: '{"volume":20}', qos: 1, retained: false});
        equal(invoke('decode', {transport: 'mqtt', operation: 'report', topic: 'vendor/demo-1/state', body: '{"deviceId":"demo-1","volume":20}'}),
          {operation: 'report', deviceId: 'demo-1', points: [{pointId: 'volume', value: 20}]});
        equal(invoke('decode', {transport: 'mqtt', operation: 'report', topic: 'vendor/demo-1/state', body: null}), {operation: 'ignore'});
        equal(invoke('decode', {transport: 'mqtt', operation: 'report', topic: 'vendor/demo-1/state', body: '{"deviceId":"other","volume":20}'}), {operation: 'ignore'});
      }
      if (kind !== 'skeleton') {
        invoke('decode', {operation: 'discoverPoints', deviceId: 'demo-1', bytes: null, body: null});
      }
      const transports = kind === 'tcp-udp' ? ['tcp', 'udp'] : [kind === 'skeleton' ? 'tcp' : kind];
      for (const transport of transports) graalCases.push({name: `${locale}/${kind}/${transport}`, source, transport,
        fixtures: fixtures.map(fixture => ({...fixture, input: {...fixture.input, transport}}))});
    }
  }
}
for (const name of names) equal(examples.get(`en/${name}`), examples.get(`zh/${name}`));

// 补齐旧版订阅入口的英文页；无侧栏归属的页面不能使用 useCurrentSidebarCategory。
for (const directory of Object.values(locales)) {
  const path = resolve(root, directory, '../aqara-developer/subscription.tag.mdx');
  const text = await readFile(path, 'utf8');
  await compile({value: text, path});
  checks += 1;
  ok(/^id: subscription\s*$/m.test(text), 'Subscription entry must preserve its public document ID');
  ok(!text.includes('useCurrentSidebarCategory'), 'Subscription entry has no sidebar category');
  for (const link of ['../aqara-studio/data-export-by-mqtt.mdx', './data-export-api/mqtt-api/mqtt-api.mdx']) {
    ok(text.includes(`](${link})`), `Subscription entry is missing its API/setup link: ${link}`);
    await access(resolve(dirname(path), link));
  }
}

// 用文档自身的 MQTT 示例检查采集/重放衔接；这里只模拟已核对的输入形状，不模拟真实采集器。
for (const locale of Object.keys(locales)) {
  const reference = documents.get(`${locale}/protocol-script-mcp-api`);
  const blocks = jsonBlocks(reference);
  const capture = blocks.find(value => value.payloadMode === 'sanitized');
  const replay = blocks.find(value => value.scriptContent && value.frames);
  equal(capture.payloadPolicy.format, 'json');
  equal(capture.payloadPolicy.jsonPointers, ['/deviceId', '/volume']);
  equal(replay.context, {operation: 'report', topic: 'vendor/demo-1/state'});
  const body = {deviceId: 'demo-1', volume: 20};
  const selected = Object.fromEntries(capture.payloadPolicy.jsonPointers.map(pointer => {
    ok(/^\/[A-Za-z0-9_-]+$/.test(pointer), 'This documentation fixture selects flat vendor-body leaves');
    const key = pointer.slice(1);
    ok(Object.hasOwn(body, key), `The vendor body is missing ${key}`);
    return [key, body[key]];
  }));
  const retainedInput = {transport: 'mqtt', operation: 'report', body: JSON.stringify(selected)};
  const context = vm.createContext({});
  new vm.Script(examples.get(`${locale}/unified-protocol-script`)[3])
    .runInContext(context, {timeout: 500});
  const invoke = input => call(context, 'decode', input);
  equal(invoke({...retainedInput, ...replay.context}), replay.frames[0].expected);
  // 修复前没有补 topic，且白名单按统一结果而非厂商正文取值；两种遗漏均使同一断言失败。
  const noTopic = invoke(retainedInput);
  equal(noTopic, {operation: 'ignore'});
  assert.throws(() => assert.deepEqual(noTopic, replay.frames[0].expected));
  checks += 1;
  const noVolume = invoke({...retainedInput, ...replay.context, body: JSON.stringify({deviceId: 'demo-1'})});
  equal(noVolume, {operation: 'ignore'});
  assert.throws(() => assert.deepEqual(noVolume, replay.frames[0].expected));
  checks += 1;

  const playbook = documents.get(`${locale}/ai-agent-device-onboarding`);
  const title = playbook.match(/^title: "([^"]+)"/m)?.[1];
  ok(title && !title.includes('AI Agent'), 'The integration guide must address both people and Agents');
  ok(playbook.split(/\r?\n/).includes(`# ${title}`), 'The page title and visible heading must match');
  equal((playbook.match(/^## /gm) || []).length, 4);
  equal((playbook.match(/^<details>$/gm) || []).length, 1);
  equal((playbook.match(/^<\/details>$/gm) || []).length, 1);
  for (const name of ['unified-protocol-script', 'protocol-script-mcp-api']) {
    ok(playbook.includes(`./${name}.mdx`), `Missing secondary reference ${name}`);
    ok(documents.get(`${locale}/${name}`).includes('displayed_sidebar: aqaraStudioSidebar'),
      'Secondary references must retain the original site navigation');
  }
  ok(playbook.includes('{#api-workflow}') && playbook.includes('{#workflow}'), 'Both integration entrances must be present');
  const read = blocks.find(value => value.command === 'readScript');
  ok(read, 'The API reference needs an explicit saved-source readback command');
  equal(Object.keys(read.input), ['scriptPath']);
  ok(reference.includes('Station.station.communication'), 'Script-file permission owner must be explicit');
  ok(reference.includes('captureWindow') && reference.includes('readPayloadCapture.frames[].sequence'),
    'Payload replay must distinguish its cursor from metadata capture');
  const specification = documents.get(`${locale}/unified-protocol-script`);
  checks += checkSpecConceptLinks(specification);
  checks += checkPublishedSpecConcepts(await readFile(resolve(root, locales[locale], specConceptsLink), 'utf8'));
  assert.throws(() => checkPublishedSpecConcepts('---\ndraft: true\n---\n'));
  checks += 1;
  checks += checkFirstUploadPaths(reference);
  ok(specification.includes('./protocol-script-mcp-api.mdx#script-files'), 'First-upload storage reference missing');
  // 旧链接或缺少命名空间规则/任一协议示例必须失败，防止只检查关键词而漏掉具体入口。
  assert.throws(() => checkSpecConceptLinks(specification.replace(specConceptsLink, 'http://localhost:3000/core-concepts')));
  assert.throws(() => checkFirstUploadPaths(reference.replace('`[A-Za-z0-9._-]`', '')));
  assert.throws(() => checkFirstUploadPaths(reference.replace(/^\| `mqtt:MqttConnNetwork`.*\r?\n/m, '')));
  assert.throws(() => checkFirstUploadPaths(reference.replace(
    'file:%/protocol-scripts/mqtt_MqttConnNetwork/vendor.js', 'file:%/protocol-scripts/mqtt:MqttConnNetwork/vendor.js')));
  checks += 4;
  ok(specification.includes('encode(ack)'), 'Report ACK input must be documented');
  ok(specification.includes('128'), 'TCP fallback chunk limit missing');
  ok(specification.includes('connectionType=4'), 'X.509 mode boundary missing');
}
console.log('Replay example regression checked: missing topic or missing vendor value fails the expected output (Node VM only).');

for (const directory of Object.values(locales)) {
  for (const transport of ['tcp', 'udp', 'http', 'mqtt']) {
    const page = await readFile(resolve(root, directory, 'device-integration', `${transport}.mdx`), 'utf8');
    ok(!/(buildDiscoveryRequest|parseDiscoveryResponse|buildDiscoverPointsRequest|parseDiscoverPointsResponse)/.test(page),
      `Legacy discovery instructions in ${directory}/${transport}`);
    ok(page.includes('ai-agent-device-onboarding.mdx'), 'Protocol tutorial must link to the shared integration guide');
    ok(!/AI Agent|MCP\/API/.test(page), 'Keep detailed programmatic integration in the shared guide');
  }
  const developer = await readFile(resolve(root, directory, 'developer-guide.mdx'), 'utf8');
  ok(!/ai-agent-device-onboarding|unified-protocol-script|protocol-script-mcp-api/.test(developer),
    'Developer Guide must retain its original API scope');
  const mcp = await readFile(resolve(root, directory, 'set-up-mcp-server.mdx'), 'utf8');
  equal((mcp.match(/ai-agent-device-onboarding\.mdx/g) || []).length, 1);
  ok(!/protocol-script-mcp-api|unified-protocol-script|validateScript|uploadScript/.test(mcp),
    'MCP setup should link to, not duplicate, the script workflow');
}

const sidebars = JSON.parse(await readFile(resolve(root, 'versioned_sidebars/version-Beta-sidebars.json'), 'utf8'));
const categories = items => items.flatMap(item => typeof item === 'object' && item.type === 'category'
  ? [item, ...categories(item.items || [])] : []);
const studioCategories = categories(sidebars.aqaraStudioSidebar);
const developerCategory = studioCategories.find(item => item.label === 'Developer');
const scriptCategory = studioCategories.find(item => item.label === 'JavaScript for Integration');
ok(developerCategory && scriptCategory, 'Original navigation categories must remain');
ok(!JSON.stringify(developerCategory).includes('ai-agent-device-onboarding'), 'Keep the script guide out of Developer navigation');
equal(scriptCategory.items.filter(item => item === 'aqara-studio/ai-agent-device-onboarding').length, 1);
for (const name of ['unified-protocol-script', 'protocol-script-mcp-api']) {
  equal(scriptCategory.items.filter(item => item === `aqara-studio/${name}`).length, 1);
}
for (const name of names.filter(name => name.startsWith('javascript-for-'))) {
  ok(!JSON.stringify(sidebars).includes(`aqara-studio/${name}`), 'Merged references must not remain in navigation');
}

// 从实际源码核对公开命令及 REST 路由，避免文档凭方案名称编造接口。
if (process.env.STUDIO_SOURCE_ROOT) {
  const source = (module, path) => readFile(resolve(process.env.STUDIO_SOURCE_ROOT, module, path), 'utf8');
  const open = 'AIOT_studio_open';
  const base = 'src/main/kotlin/com/lumi/framework/open/';
  const schema = await source(open, `${base}server/service/ProtocolDebugSchema.kt`);
  const registry = await source(open, `${base}server/service/OpenResourceProviderRegistry.kt`);
  const routes = await source(open, `${base}server/routing/OpenApiResourceRoutes.kt`);
  const points = await source(open, `${base}mcp/point/PointMappingSchemas.kt`);
  const scripts = await source(open, 'src/main/kotlin/com/lumi/framework/agent/skill/builtin/ProtocolScriptSupport.kt');
  const namesFromSource = [
    ...[...schema.matchAll(/^\s*"(\w+)" to command\(/gm)].map(match => match[1]),
    'connectionSnapshot', 'startDebugSession', 'validateScript', 'listScripts', 'readScript', 'uploadScript',
  ];
  const pointOperations = points.match(/val operations = listOf\(([^)]+)\)/)?.[1];
  ok(pointOperations, 'Point operation declaration missing');
  const tools = [...pointOperations.matchAll(/"(\w+)"/g)].map(match => `protocol_point_${match[1]}`);
  for (const locale of Object.keys(locales)) {
    const reference = documents.get(`${locale}/protocol-script-mcp-api`);
    for (const command of [...namesFromSource, ...tools]) ok(reference.includes(command), `Missing ${command} in ${locale}`);
    for (const match of routes.matchAll(/OpenApiRouteDef\(HttpMethod\.\w+, "([^"]+)"/g)) {
      ok(reference.includes(match[1]), `Undocumented route ${match[1]}`);
    }
    for (const uri of ['protocol-script', 'protocol-debug', 'protocol-point', 'resource-api', 'mcp']) {
      ok(reference.includes(`agent://contracts/${uri}/guide`), `Missing runtime guide ${uri}`);
    }
    ok(reference.includes('1,048,576'), 'Script and fixture size budget missing');
  }
  for (const command of ['startDebugSession', 'connectionSnapshot']) ok(registry.includes(`"${command}"`), command);
  for (const command of ['validationSchema', 'uploadSchema', 'readSchema', 'listSchema']) ok(scripts.includes(command), command);
  const numeric = await source('AIOT_studio_script', 'src/main/kotlin/com/lumi/framework/script/ScriptPointSupport.kt');
  ok(!/readOptional(?:Int|Double)Member\(pointObject,\s*FIELD_PRECISION/.test(numeric), 'precision behavior changed; recheck docs');

  const permission = await source(open, `${base}server/service/ProtocolScriptValidationResource.kt`);
  equal((permission.match(/canManage\(Station\.station\.communication,/g) || []).length, 2);
  const readResult = scripts.slice(scripts.indexOf('fun readScript('), scripts.indexOf('fun uploadScript('));
  const readKeys = [...readResult.matchAll(/put\("(\w+)"/g)].map(match => match[1]);
  for (const key of ['scriptPath', 'referenceCount']) ok(readKeys.includes(key), `readScript result changed: ${key}`);
  for (const key of ['extensionScriptPath', 'replaced', 'reloadFailedCount']) {
    ok(!readKeys.includes(key), `readScript now returns ${key}; recheck docs`);
  }
  const fileStore = await source('AIOT_studio_script', 'src/main/kotlin/com/lumi/framework/script/ScriptFileStore.kt');
  const protectedFiles = await source('AIOT_studio_common', 'server-common/src/commonMain/kotlin/com/lumi/framework/file/ProtectedScriptFiles.kt');
  ok(fileStore.includes('ProtectedScriptFiles.networkNamespace(beanId)') &&
    protectedFiles.includes('beanId.trim().replace(Regex("[^A-Za-z0-9._-]"), "_").trim(\'_\')'),
    'Script namespace normalization changed; recheck first-upload examples');
  ok(scripts.includes('put("networkBeanId", beanId)') && scripts.includes('putJsonArray("scripts")'),
    'listScripts must return the beanId even when the file list is empty');
  const debug = await source(open, `${base}server/service/ProtocolDebugService.kt`);
  ok(debug.includes('operation != "probe" && point == null'), 'Debug report/read target contract changed');
  ok(debug.includes('value.toString().toByteArray(Charsets.UTF_8).size <= 512'), 'Expected-value budget changed');
  const payload = await source('AIOT_studio_script', 'src/main/kotlin/com/lumi/framework/script/debug/DebugPayloadCapture.kt');
  const retained = payload.slice(payload.indexOf('val message = buildJsonObject'), payload.indexOf('val hex ='));
  for (const key of ['transport', 'operation', 'deviceId', 'pointId', 'body', 'bytes']) {
    ok(retained.includes(`"${key}"`), `Retained payload input changed: ${key}`);
  }
  for (const key of ['topic', 'path', 'requestId', 'config', 'statusCode', 'headers']) {
    ok(!retained.includes(`"${key}"`), `Capture now retains ${key}; recheck docs`);
  }
  const captureInput = await source('AIOT_studio_script', 'src/main/kotlin/com/lumi/framework/script/debug/ScriptPayloadCapture.kt');
  ok(captureInput.includes('policy.format == "bytes" || body == null'), 'Payload body/bytes selection changed');
  const payloadService = await source(open, `${base}server/service/ProtocolPayloadDebugSupport.kt`);
  ok(payloadService.includes('setOf("operation", "deviceId", "pointId", "requestId", "topic", "path", "config")'),
    'Replay context allowlist changed');
  const tcp = await source('AIOT_studio_tcp', 'src/main/kotlin/com/lumi/framework/tcp/comm/TcpRxConn.kt');
  const tcpFrames = await source('AIOT_studio_tcp', 'src/main/kotlin/com/lumi/framework/tcp/comm/TcpFrameReader.kt');
  ok(tcp.includes('TcpFrameReader.read(') && tcpFrames.includes('PARSE_RECEIVED_READ_SIZE = 128') &&
    tcpFrames.includes('channel.readAvailable(data, 0, data.size)'),
    'TCP fallback no longer matches the documented chunk behavior');
  const connection = await source('AIOT_studio_script', 'src/main/kotlin/com/lumi/framework/script/ScriptConnectionConfig.kt');
  ok(connection.includes('1_000, 86_400_000') && connection.includes('1, 3_600_000'),
    'TCP connection time ranges changed; recheck both translations');
  const frames = await source('AIOT_studio_script', 'src/main/kotlin/com/lumi/framework/script/ScriptFrameConfig.kt');
  ok(frames.includes('getMember("delimiterBytes")') && frames.includes('minOf(16, limit)') &&
    frames.includes('Delimiter framing cannot include length framing'), 'TCP delimiter constraints changed');
  const protocol = await source('AIOT_studio_script', 'src/main/kotlin/com/lumi/framework/script/ScriptProtocol.kt');
  ok(protocol.includes('const val DISCONNECT = "disconnect"'), 'TCP disconnect operation is unavailable');
  const udp = await source('AIOT_studio_udp', 'src/main/kotlin/com/lumi/framework/udp/UdpMessageParser.kt');
  ok(udp.includes('val socket = DatagramSocket()'), 'UDP discovery bind behavior changed');
  ok(!udp.includes('getMember("responsePort")') && !udp.includes('getMember("responseIp")'),
    'UDP plugin added reply-listener overrides; recheck docs');
  const udpFrames = await source('AIOT_studio_udp', 'src/main/kotlin/com/lumi/framework/udp/comm/UdpRxConn.kt');
  ok(udpFrames.includes('return data.copyOfRange(start, start + totalLength)'), 'UDP frame extraction changed');
  const mqttAuth = await source('AIOT_studio_mqtt', 'src/main/kotlin/com/lumi/framework/mqtt/util/AMqttConnectionType.kt');
  ok(mqttAuth.includes('X509_OVER_SSL = 4'), 'MQTT X.509 mode changed');
  const mqttIdentity = await source('AIOT_studio_mqtt', 'src/main/kotlin/com/lumi/framework/mqtt/MqttScriptIdentity.kt');
  ok(mqttIdentity.includes('?.deviceId?.takeIf(String::isNotBlank) ?: getDeviceUuid()'),
    'MQTT empty/whitespace business-ID fallback changed; recheck docs');
  const mqttProxy = await source('AIOT_studio_mqtt', 'src/main/kotlin/com/lumi/framework/mqtt/proxyExt/subAndPub/MqttSubAndPubExt.kt');
  ok(mqttProxy.includes('getDevice().getMqttScriptDeviceId()'), 'MQTT ordinary paths do not use the common identity resolver');
  ok(mqttProxy.includes('parser.buildReadRequest(getScriptDeviceId(), pointUuid)'), 'MQTT ordinary read identity differs from docs');
  ok(mqttProxy.includes('parser.buildWriteRequest(getScriptDeviceId(), pointUuid, rValue)'), 'MQTT ordinary write identity differs from docs');
  ok(mqttProxy.includes('getRefreshFrequency(): ARefreshFrequency = ARefreshFrequency.normal'), 'MQTT refresh tier changed');
  const mqttRoute = await source('AIOT_studio_mqtt', 'src/main/kotlin/com/lumi/framework/mqtt/handler/MqttPointMessageDispatcher.kt');
  equal((mqttRoute.match(/getScriptDeviceId\(\)/g) || []).length, 2);
  ok(!mqttRoute.includes('getDeviceUuid()'), 'MQTT report ownership still uses a connection ID');
  ok(mqttRoute.includes('targetPoints.any { it.getDevice() !== targetDevice }'), 'MQTT ambiguous-device report guard missing');
  const mqttDebug = await source('AIOT_studio_mqtt', 'src/main/kotlin/com/lumi/framework/mqtt/MqttProtocolDebugAdapter.kt');
  ok(mqttDebug.includes('val deviceId = request.device.getMqttScriptDeviceId()') &&
    mqttDebug.includes('parser.buildReadRequest(deviceId,') && mqttDebug.includes('parser.buildWriteRequest(deviceId,'),
    'MQTT debug read/write identity differs from ordinary paths');
  const mqttPointDiscovery = await source('AIOT_studio_mqtt', 'src/main/kotlin/com/lumi/framework/mqtt/discover/MqttDeviceDiscoverPointsJob.kt');
  ok(mqttPointDiscovery.includes('val deviceId = device.getMqttScriptDeviceId()'), 'MQTT point discovery identity differs from runtime');
  const mqttDiscovery = await source('AIOT_studio_mqtt', 'src/main/kotlin/com/lumi/framework/mqtt/discover/MqttDiscoverDevicesJob.kt');
  ok(mqttDiscovery.includes('it.getMqttScriptDeviceId()'), 'MQTT rediscovery ignores the effective identity');
  const mqttImport = await source('AIOT_studio_mqtt', 'src/main/kotlin/com/lumi/framework/mqtt/discover/MqttDiscoveryDevice.kt');
  ok(mqttImport.includes('it.getMqttScriptDeviceId() == this.deviceId'), 'MQTT import identity differs from rediscovery');
  const httpDevice = await source('AIOT_studio_http', 'src/main/kotlin/com/lumi/framework/http/HttpDevice.kt');
  ok(httpDevice.includes('override fun doProbe()') && httpDevice.includes('probeOk()') && !httpDevice.includes('buildDebugProbeRequest'),
    'HTTP ordinary probing changed; recheck docs');
  const resource = await source(open, `${base}server/service/OpenResourceService.kt`);
  ok(resource.includes('put("schema", it.withResourceNameSchema())'), 'Protocol instance schema wrapper changed');
  const resourceContract = await source(open, `${base}server/service/ProtocolResourceContract.kt`);
  ok(resource.includes('put(protocolId, ProtocolResourceContract.creationConfigSchema(it))') &&
    resource.includes('ProtocolResourceContract.schemaDescription(protocols)') &&
    resourceContract.includes('put("protocols", protocols)'), 'Protocol type schema wrapper changed');
  ok(resource.includes('put("hasMore", hasMore)'), 'Resource pagination changed');
  const paging = await source(open, `${base}server/service/OpenResourceDefinitionRegistry.kt`);
  ok(paging.includes('OPEN_RESOURCE_DEFAULT_PAGE_SIZE = 20') && paging.includes('OPEN_RESOURCE_MAX_PAGE_SIZE = 100'),
    'Resource page limits changed');
  for (const locale of Object.keys(locales)) {
    const reference = documents.get(`${locale}/protocol-script-mcp-api`);
    for (const key of ['data.schema', 'data.protocols.<protocolId>', 'data.hasMore']) {
      ok(reference.includes(key), `Missing actual Resource response path ${key}`);
    }
    ok(documents.get(`${locale}/ai-agent-device-onboarding`).includes('transport-readiness'), 'Transport assessment missing');
  }
  const generationGuide = await source(open, 'src/main/resources/protocol-script-generation-guide.md');
  const debugGuide = await source(open, 'src/main/resources/protocol-debug-guide.md');
  checks += checkFirstUploadPaths(generationGuide);
  checks += checkGenerationTemplate(generationGuide);
  assert.throws(() => checkGenerationTemplate(generationGuide.replace(
    '用 resource_read 回读实例 data.schema', '回读实例 configSchema')));
  checks += 1;
  for (const guide of [generationGuide, debugGuide]) {
    checks += checkMqttIdentityCompatibility(guide, 'zh');
    assert.throws(() => checkMqttIdentityCompatibility(guide.replace(
      '空字符串或纯空白时回退到', 'identity-rule-removed'), 'zh'));
    checks += 1;
    ok(guide.includes('data.schema') && guide.includes('hasMore'), 'Bundled guide uses stale Resource paths');
    ok(guide.includes('Station.station.communication'), 'Bundled guide omits permission owner');
  }
  const captureExample = jsonBlocks(debugGuide).find(value => value.payloadMode === 'sanitized');
  equal(captureExample.payloadPolicy.jsonPointers, ['/deviceId', '/volume']);
  const replayExample = jsonBlocks(debugGuide).find(value => value.scriptContent && value.frames);
  equal(replayExample.context, {operation: 'report', topic: 'vendor/example/state'});
  ok(debugGuide.includes('readPayloadCapture.frames[].sequence'), 'Bundled guide conflates capture cursors');
  const httpTemplate = JSON.parse(await source('AIOT_studio_http', 'src/main/resources/protocolConfig/http.json'));
  const mqttTemplate = JSON.parse(await source('AIOT_studio_mqtt', 'src/main/resources/protocolConfig/mqtt.json'));
  const templateFields = template => template.configs.flatMap(config => config.groups.flatMap(group => group.properties));
  ok(!templateFields(httpTemplate).some(field => /httpServlet|WebService/.test(field)), 'HTTP callback configuration added; reassess gap');
  ok(!templateFields(mqttTemplate).some(field => /certificate|privateKey|rootCa/i.test(field)), 'MQTT certificate configuration added; reassess gap');
  console.log(`Source conformance checked against ${resolve(process.env.STUDIO_SOURCE_ROOT)}`);
} else {
  console.log('Source conformance skipped: set STUDIO_SOURCE_ROOT to the reviewed Studio checkout root.');
}
checks += await checkDocNavigation(root);
console.log(`Protocol documentation checks passed: ${checks}; no device I/O or GraalJS execution performed.`);
if (process.env.PROTOCOL_DOC_FIXTURES_OUT) {
  // 导出已校验的文档正文及完整断言，供独立 Studio/GraalJS 校验器消费；不发送设备报文。
  await writeFile(resolve(process.env.PROTOCOL_DOC_FIXTURES_OUT), JSON.stringify(graalCases, null, 2), 'utf8');
  console.log(`Exported ${graalCases.length} candidate/transport groups for separate GraalJS validation.`);
}
