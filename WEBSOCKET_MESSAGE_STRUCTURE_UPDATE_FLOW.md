# WebSocket 消息结构说明更新流程

本文说明：当您更新以下 AsyncAPI YAML 文件后，如何同步更新 `message-structure.mdx` 文档。

- 中文源文件：`asyncapi/data-export-api/zh/asyncapi-AqaraLife-websocket.yaml`
- 英文源文件：`asyncapi/data-export-api/en/asyncapi-AqaraLife-websocket.yaml`

## 整体关系

- YAML 文件是消息结构说明的源数据。
- `npm run gen-websocket-message-structure` 会读取 `#/components/messages`，按源文件中的消息顺序生成 MDX。
- 生成的 MDX 直接作为文档页面，不需要再手工整理消息描述、参数表或示例。

## 对应页面

- 中文页面：`i18n/zh/docusaurus-plugin-content-docs/version-Beta/aqara-developer/data-export-api/websocket-api/message-structure.mdx`
  - 基于中文 YAML：`asyncapi/data-export-api/zh/asyncapi-AqaraLife-websocket.yaml`
  - 一级标题为「消息结构说明」，三级标题为「描述」「参数」「示例」

- 英文页面：`versioned_docs/version-Beta/aqara-developer/data-export-api/websocket-api/message-structure.mdx`
  - 基于英文 YAML：`asyncapi/data-export-api/en/asyncapi-AqaraLife-websocket.yaml`
  - 一级标题为 “Message Structure”，三级标题为 “Description”“Parameters”“Example”

两条文档的二级标题都是 `#/components/messages` 下的消息名，例如 `AuthRequest`、`AuthResponse`。

## 更新步骤

1. 修改中文 YAML 文件。

```bash
asyncapi/data-export-api/zh/asyncapi-AqaraLife-websocket.yaml
```

2. 修改英文 YAML 文件。

```bash
asyncapi/data-export-api/en/asyncapi-AqaraLife-websocket.yaml
```

3. 运行生成脚本，重建两份 `message-structure.mdx`。

```bash
npm run gen-websocket-message-structure
```

4. 如需本地预览页面，启动开发环境。

```bash
npm run start
```

5. 如需做完整校验，执行生产构建。

```bash
npm run build
```

## 生成结果

执行 `npm run gen-websocket-message-structure` 后，会自动更新以下文件：

- `i18n/zh/docusaurus-plugin-content-docs/version-Beta/aqara-developer/data-export-api/websocket-api/message-structure.mdx`
- `versioned_docs/version-Beta/aqara-developer/data-export-api/websocket-api/message-structure.mdx`

脚本入口是 `scripts/generate-websocket-message-structure.mjs`。每个消息写入「描述」和「参数」；源文档提供了 `examples` 时再写入「示例」：

- 描述使用消息的 `title`、`summary`、`description`，以及 payload schema 上的说明
- 参数展开 payload schema，包含嵌套字段、数组元素、额外字段和按条件区分的结构
- 示例使用消息上的 `examples`。没有示例时不生成这一节；只有一个示例时输出 JSON 代码块；有多个示例时用 `ExampleTabs` 切换。选项放不下时出现展开按钮，移动端按钮在选项行下方

## 自动同步的内容

只要这些内容写在 YAML 的 `#/components/messages` 及其引用的 schema 里，运行生成脚本后就会自动同步到页面：

- 消息顺序与消息名
- Message 标题、摘要、描述
- Example 示例
- Payload schema
- 参数名、类型、必填和说明
- 参数说明中出现的 `#/components/messages` 消息名，会链接到同页对应消息标题
- `required`
- `nullable`
- `enum`
- 默认值、长度、数量和格式约束
- `allOf` 合并后的字段
- `if` / `then` 条件下的字段结构

## 只改 YAML 就够的场景

以下场景通常不需要改生成脚本：

- 新增 message
- 删除 message
- 调整 message 顺序
- 修改 message 描述
- 新增参数
- 删除参数
- 修改参数说明
- 修改 schema 结构
- 修改 example 示例

## 仍需要改脚本的场景

以下场景通常不只是改 YAML，还需要改 `scripts/generate-websocket-message-structure.mjs`：

- 修改文档一级标题或三级标题文案
- 修改参数表的列名、必填文案或空内容文案
- 修改生成文件的输出路径
- 调整每个消息下的章节结构

页面是否出现在侧边栏由 `versioned_sidebars/version-Beta-sidebars.json` 决定。生成脚本不会改侧边栏。当前两条文档已经挂在 WebSocket 分类下，只更新消息内容时不需要再改侧边栏。

## 推荐执行方式

每次修改完 YAML 后，至少执行以下命令：

```bash
npm run gen-websocket-message-structure
npm run build
```

这样可以确保：

- 中文和英文 `message-structure.mdx` 已同步更新
- 页面可以正常编译
- 没有因为 schema 变化导致文档渲染异常

## 备注

消息结构说明按语言分别读取各自的 YAML：

- 中文页面读取中文 YAML 的生成结果
- 英文页面读取英文 YAML 的生成结果

因此后续维护时，应优先修改 YAML，再运行生成脚本，而不是直接手改 `message-structure.mdx`。生成文件顶部也有对应的生成标记。
