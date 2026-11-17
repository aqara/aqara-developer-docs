import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

const rootDir = process.cwd();

const targets = [
  {
    locale: "zh",
    input: path.join(
      rootDir,
      "asyncapi/data-export-api/zh/asyncapi-AqaraLife-websocket.yaml"
    ),
    output: path.join(
      rootDir,
      "i18n/zh/docusaurus-plugin-content-docs/version-Beta/aqara-developer/data-export-api/websocket-api/message-structure.mdx"
    ),
  },
  {
    locale: "en",
    input: path.join(
      rootDir,
      "asyncapi/data-export-api/en/asyncapi-AqaraLife-websocket.yaml"
    ),
    output: path.join(
      rootDir,
      "versioned_docs/version-Beta/aqara-developer/data-export-api/websocket-api/message-structure.mdx"
    ),
  },
];

const labels = {
  zh: {
    title: "消息结构说明",
    frontDescription: "Aqara Studio WebSocket 各消息的结构、参数与示例。",
    descriptionHeading: "描述",
    parametersHeading: "参数",
    exampleHeading: "示例",
    exampleLabel: (index) => `示例 ${index}`,
    columns: ["参数", "类型", "必填", "说明"],
    yes: "是",
    no: "否",
    emptyCell: "—",
    anyType: "任意",
    typeOr: " 或 ",
    emptyDescription: "源文档未提供描述。",
    emptyParameters: "源文档未定义参数。",
    constraintGap: "",
    additionalProperties: "允许额外字段。",
    additionalPropertiesTyped: (type) => `额外字段类型为 \`${type}\`。`,
    constant: (value) => `固定值：\`${value}\`。`,
    enums: (values, descriptions) => enumList("枚举", values, descriptions),
    itemConstant: (value) => `元素固定值：\`${value}\`。`,
    itemEnums: (values, descriptions) => enumList("元素枚举", values, descriptions),
    defaultValue: (value) => `默认值：\`${value}\`。`,
    minimum: (value) => `最小值：\`${value}\`。`,
    maximum: (value) => `最大值：\`${value}\`。`,
    minLength: (value) => `最小长度：${value}。`,
    maxLength: (value) => `最大长度：${value}。`,
    itemMinLength: (value) => `元素最小长度：${value}。`,
    itemMaxLength: (value) => `元素最大长度：${value}。`,
    minItems: (value) => `最少 ${value} 项。`,
    maxItems: (value) => `最多 ${value} 项。`,
    uniqueItems: "元素不可重复。",
    minProperties: (value) => `最少 ${value} 个字段。`,
    maxProperties: (value) => `最多 ${value} 个字段。`,
    pattern: (value) => `模式：\`${value}\`。`,
    itemPattern: (value) => `元素模式：\`${value}\`。`,
    pair: (left, right) => `\`${left}\` 与 \`${right}\` 需要同时出现。`,
    conditionalRequired: (condition, fields) =>
      `当 ${condition} 时，${fields.join("、")} 为必填。`,
    variantIntro: (condition, propertyPath, required, schemaName) =>
      `当 ${condition} 时，\`${propertyPath}\`${required ? " 为必填，" : " "}${schemaName ? `结构为 \`${schemaName}\`，说明如下：` : "结构如下："}`,
    fieldNote: (propertyPath, detail) => `\`${propertyPath}\`：${detail}`,
    conditionClause: (propertyPath, values) =>
      `\`${propertyPath}\` 为 ${joinValues(values, "、")}`,
    conditionJoiner: "，且 ",
  },
  en: {
    title: "Message Structure",
    frontDescription:
      "Structure, parameters, and examples for each Aqara Studio WebSocket message.",
    descriptionHeading: "Description",
    parametersHeading: "Parameters",
    exampleHeading: "Example",
    exampleLabel: (index) => `Example ${index}`,
    columns: ["Parameter", "Type", "Required", "Description"],
    yes: "Yes",
    no: "No",
    emptyCell: "—",
    anyType: "any",
    typeOr: " or ",
    emptyDescription: "The source document does not provide a description.",
    emptyParameters: "The source document does not define parameters.",
    constraintGap: " ",
    additionalProperties: "Additional properties are allowed.",
    additionalPropertiesTyped: (type) => `Additional property type: \`${type}\`.`,
    constant: (value) => `Fixed value: \`${value}\`.`,
    enums: (values, descriptions) => enumList("Allowed values", values, descriptions),
    itemConstant: (value) => `Fixed item value: \`${value}\`.`,
    itemEnums: (values, descriptions) => enumList("Allowed item values", values, descriptions),
    defaultValue: (value) => `Default: \`${value}\`.`,
    minimum: (value) => `Minimum: \`${value}\`.`,
    maximum: (value) => `Maximum: \`${value}\`.`,
    minLength: (value) => `Minimum length: ${value}.`,
    maxLength: (value) => `Maximum length: ${value}.`,
    itemMinLength: (value) => `Minimum item length: ${value}.`,
    itemMaxLength: (value) => `Maximum item length: ${value}.`,
    minItems: (value) => `Minimum items: ${value}.`,
    maxItems: (value) => `Maximum items: ${value}.`,
    uniqueItems: "Items must be unique.",
    minProperties: (value) => `Minimum properties: ${value}.`,
    maxProperties: (value) => `Maximum properties: ${value}.`,
    pattern: (value) => `Pattern: \`${value}\`.`,
    itemPattern: (value) => `Item pattern: \`${value}\`.`,
    pair: (left, right) => `\`${left}\` and \`${right}\` must appear together.`,
    conditionalRequired: (condition, fields) =>
      `When ${condition}, ${fields.join(", ")} are required.`,
    variantIntro: (condition, propertyPath, required, schemaName) =>
      `When ${condition}, \`${propertyPath}\` ${required ? "is required and has" : "has"} ${schemaName ? `the \`${schemaName}\` structure` : "the following structure"}:`,
    fieldNote: (propertyPath, detail) => `\`${propertyPath}\`: ${detail}`,
    conditionClause: (propertyPath, values) =>
      `\`${propertyPath}\` is ${joinValues(values, ", ")}`,
    conditionJoiner: " and ",
  },
};

function joinValues(values, separator) {
  return values.map((value) => `\`${value}\``).join(separator);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;")
    .replace(/\|/g, "&#124;")
    .replace(/\r?\n+/g, " ");
}

function enumList(label, values, descriptions) {
  const items = values
    .map((value) => {
      const description = descriptions?.[value];
      const text =
        typeof description === "string" && description.trim()
          ? `<code>${escapeHtml(value)}</code>: ${escapeHtml(description.trim())}`
          : `<code>${escapeHtml(value)}</code>`;
      return `<li>${text}</li>`;
    })
    .join("");
  return `\u0000<div><span>${escapeHtml(label)}</span><ul className="enum-list">${items}</ul></div>\u0000`;
}

function joinPath(parent, child) {
  if (!parent) return child ?? "";
  if (!child) return parent;
  return `${parent}.${child}`;
}

function formatLiteral(value) {
  if (typeof value === "string" && value.length > 0) return value;
  return JSON.stringify(value);
}

function mergeText(base, extra) {
  const left = typeof base === "string" ? base.trim() : "";
  const right = typeof extra === "string" ? extra.trim() : "";
  if (!left) return right;
  if (!right || left === right || left.includes(right)) return left;
  if (right.includes(left)) return right;
  return `${left}\n\n${right}`;
}

function mergeSchemas(base, extra, descriptionMode = "concat") {
  if (!base) return extra ?? base;
  if (!extra || Object.keys(extra).length === 0) return base;

  const merged = {...base, ...extra};
  const extraDescription =
    typeof extra.description === "string" ? extra.description.trim() : "";

  if (descriptionMode === "override") {
    if (extraDescription) merged.description = extra.description;
    else if (extra.enum) delete merged.description;
    else merged.description = base.description;
  } else {
    const description = mergeText(base.description, extra.description);
    if (description) merged.description = description;
  }

  if (base.properties || extra.properties) {
    const names = new Set([
      ...Object.keys(base.properties ?? {}),
      ...Object.keys(extra.properties ?? {}),
    ]);
    merged.properties = {};
    for (const name of names) {
      merged.properties[name] = mergeSchemas(
        base.properties?.[name],
        extra.properties?.[name],
        "override"
      );
    }
  }

  if (base.items || extra.items) {
    merged.items = mergeSchemas(base.items, extra.items, "override");
  }

  if (base.required || extra.required) {
    merged.required = [
      ...new Set([...(base.required ?? []), ...(extra.required ?? [])]),
    ];
  }

  if (base.nullable || extra.nullable) merged.nullable = true;

  const conditionals = [
    ...(base.conditionals ?? []),
    ...(extra.conditionals ?? []),
  ];
  if (conditionals.length > 0) merged.conditionals = conditionals;
  else delete merged.conditionals;

  return merged;
}

function dereference(document, ref) {
  if (!ref.startsWith("#/")) {
    throw new Error(`Unsupported $ref: ${ref}`);
  }

  const node = ref
    .slice(2)
    .split("/")
    .reduce((current, key) => current?.[key], document);

  if (!node || typeof node !== "object") {
    throw new Error(`Unable to resolve ${ref}`);
  }

  return node;
}

function resolveSchema(document, schema, seen = new Set()) {
  if (!schema || typeof schema !== "object") return schema;
  if (Array.isArray(schema)) {
    return schema.map((item) => resolveSchema(document, item, seen));
  }

  if (schema.$ref) {
    if (seen.has(schema.$ref)) return {};
    const nextSeen = new Set(seen);
    nextSeen.add(schema.$ref);
    const {$ref, ...rest} = schema;
    const resolved = mergeSchemas(
      resolveSchema(document, dereference(document, $ref), nextSeen),
      resolveSchema(document, rest, seen),
      "override"
    );
    return {...resolved, schemaName: $ref.split("/").pop()};
  }

  if (Array.isArray(schema.allOf)) {
    const {allOf, ...rest} = schema;
    let merged = resolveSchema(document, rest, seen) ?? {};
    for (const part of allOf) {
      const resolvedPart = resolveSchema(document, part, seen) ?? {};
      if (resolvedPart.if || resolvedPart.then) {
        merged = {
          ...merged,
          conditionals: [
            ...(merged.conditionals ?? []),
            {if: resolvedPart.if, then: resolvedPart.then},
          ],
        };
      } else {
        merged = mergeSchemas(merged, resolvedPart, "concat");
      }
    }
    return merged;
  }

  const output = {...schema};
  if (schema.properties) {
    output.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => [
        key,
        resolveSchema(document, value, seen),
      ])
    );
  }
  for (const key of ["items", "additionalProperties", "not"]) {
    if (output[key] && typeof output[key] === "object") {
      output[key] = resolveSchema(document, output[key], seen);
    }
  }
  for (const key of ["anyOf", "oneOf"]) {
    if (Array.isArray(output[key])) {
      output[key] = output[key].map((item) =>
        resolveSchema(document, item, seen)
      );
    }
  }
  if (output.if) output.if = resolveSchema(document, output.if, seen);
  if (output.then) output.then = resolveSchema(document, output.then, seen);
  return output;
}

function isNullSchema(schema) {
  if (!schema || typeof schema !== "object") return false;
  if (schema.type === "null") return true;
  return Array.isArray(schema.type) && schema.type.every((type) => type === "null");
}

function hasNullType(schema) {
  if (!schema) return false;
  if (schema.nullable) return true;
  if (schema.type === "null") return true;
  return Array.isArray(schema.type) && schema.type.includes("null");
}

function normalizeSchema(schema) {
  if (!schema || typeof schema !== "object") return schema;
  const union = schema.anyOf || schema.oneOf;
  if (!union) return schema;

  const nonNull = union.filter((item) => !isNullSchema(item));
  if (nonNull.length !== 1 || nonNull.length === union.length) return schema;

  return mergeSchemas(
    nonNull[0],
    {
      ...(schema.description ? {description: schema.description} : {}),
      ...(schema.default !== undefined ? {default: schema.default} : {}),
      nullable: true,
    },
    "override"
  );
}

function namedTypes(schema, localeLabels) {
  if (Array.isArray(schema.type)) {
    return schema.type.filter((type) => type !== "null");
  }
  if (typeof schema.type === "string" && schema.type !== "null") return [schema.type];
  if (schema.properties) return ["object"];
  if (schema.items) return ["array"];
  if (schema.enum || schema.const !== undefined) return ["string"];
  return [];
}

function typeName(schema, localeLabels) {
  if (!schema || typeof schema !== "object") return localeLabels.anyType;
  const normalized = normalizeSchema(schema);

  if (normalized.items) {
    const text = `array<${typeName(normalized.items, localeLabels)}>`;
    return hasNullType(normalized)
      ? `${text}${localeLabels.typeOr}null`
      : text;
  }

  const union = normalized.anyOf || normalized.oneOf;
  if (union && namedTypes(normalized, localeLabels).length === 0 && !normalized.properties) {
    return union
      .map((item) => typeName(item, localeLabels))
      .join(localeLabels.typeOr);
  }

  const types = namedTypes(normalized, localeLabels);
  let text = types.join(localeLabels.typeOr);
  if (types.length === 1 && normalized.format) text += ` (${normalized.format})`;
  if (hasNullType(normalized)) {
    text = text ? `${text}${localeLabels.typeOr}null` : "null";
  }
  return text || localeLabels.anyType;
}

function constraintSentences(schema, localeLabels, item = false) {
  if (!schema || typeof schema !== "object") return [];
  const sentences = [];
  const values = Array.isArray(schema.enum)
    ? schema.enum
    : schema.const !== undefined
      ? [schema.const]
      : null;

  if (values?.length === 1) {
    const literal = formatLiteral(values[0]);
    sentences.push(
      item ? localeLabels.itemConstant(literal) : localeLabels.constant(literal)
    );
  } else if (values?.length > 1) {
    const literals = values.map(formatLiteral);
    const descriptions = schema["x-enum-descriptions"];
    sentences.push(
      item
        ? localeLabels.itemEnums(literals, descriptions)
        : localeLabels.enums(literals, descriptions)
    );
  }

  if (schema.default !== undefined) {
    sentences.push(localeLabels.defaultValue(formatLiteral(schema.default)));
  }
  if (schema.minimum != null) sentences.push(localeLabels.minimum(schema.minimum));
  if (schema.maximum != null) sentences.push(localeLabels.maximum(schema.maximum));
  if (schema.minLength != null) {
    sentences.push(
      item
        ? localeLabels.itemMinLength(schema.minLength)
        : localeLabels.minLength(schema.minLength)
    );
  }
  if (schema.maxLength != null) {
    sentences.push(
      item
        ? localeLabels.itemMaxLength(schema.maxLength)
        : localeLabels.maxLength(schema.maxLength)
    );
  }
  if (schema.minItems != null) sentences.push(localeLabels.minItems(schema.minItems));
  if (schema.maxItems != null) sentences.push(localeLabels.maxItems(schema.maxItems));
  if (schema.uniqueItems) sentences.push(localeLabels.uniqueItems);
  if (schema.minProperties != null) {
    sentences.push(localeLabels.minProperties(schema.minProperties));
  }
  if (schema.maxProperties != null) {
    sentences.push(localeLabels.maxProperties(schema.maxProperties));
  }
  if (schema.pattern) {
    sentences.push(
      item ? localeLabels.itemPattern(schema.pattern) : localeLabels.pattern(schema.pattern)
    );
  }
  return sentences;
}

function describeSchema(schema, localeLabels) {
  const normalized = normalizeSchema(schema);
  const parts = [];
  if (typeof normalized.description === "string" && normalized.description.trim()) {
    parts.push(normalized.description.trim());
  }

  const constraints = constraintSentences(normalized, localeLabels, false);
  if (normalized.items && !normalized.items.properties) {
    if (normalized.items.description?.trim()) {
      parts.push(normalized.items.description.trim());
    }
    constraints.push(...constraintSentences(normalized.items, localeLabels, true));
  }
  if (normalized.additionalProperties === true) {
    constraints.push(localeLabels.additionalProperties);
  } else if (
    normalized.additionalProperties &&
    typeof normalized.additionalProperties === "object" &&
    !isStructured(normalized.additionalProperties)
  ) {
    constraints.push(
      localeLabels.additionalPropertiesTyped(
        typeName(normalized.additionalProperties, localeLabels)
      )
    );
  }

  if (constraints.length > 0) {
    parts.push(constraints.join(localeLabels.constraintGap));
  }
  return parts.join("\n");
}

function escapeMdxInline(text, {table = false} = {}) {
  return String(text ?? "")
    .split("\u0000")
    .map((part, index) =>
      index % 2 === 1 ? part : escapeMdxText(part, {table})
    )
    .join("");
}

function escapeMdxText(text, {table = false} = {}) {
  const source = String(text ?? "");
  const pattern = /(`+)[\s\S]*?\1/g;
  let cursor = 0;
  let result = "";
  let match = pattern.exec(source);

  const escapePlain = (chunk) => {
    let plain = chunk
      .replace(/\{/g, "&#123;")
      .replace(/\}/g, "&#125;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    if (table) {
      plain = plain.replace(/\|/g, "\\|").replace(/\r?\n+/g, "<br />");
    }
    return plain;
  };

  while (match) {
    result += escapePlain(source.slice(cursor, match.index));
    result += match[0];
    cursor = match.index + match[0].length;
    match = pattern.exec(source);
  }

  return result + escapePlain(source.slice(cursor));
}

function formatCell(text, localeLabels) {
  const value = text?.trim() ? text : localeLabels.emptyCell;
  const linked = value
    .split("\u0000")
    .map((part, index) =>
      index % 2 === 1
        ? part
        : linkMessageNames(part, localeLabels.messageNames)
    )
    .join("\u0000");
  return escapeMdxInline(linked, {table: true});
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function messageAnchor(name) {
  return `#${name.toLowerCase()}`;
}

function linkMessageNames(text, messageNames) {
  if (!text || !messageNames?.length) return text;

  const namePattern = new RegExp(
    `\\b(?:${messageNames.map(escapeRegExp).join("|")})\\b`,
    "g"
  );
  const knownNames = new Set(messageNames);
  const codePattern = /(`+)([\s\S]*?)\1/g;
  let cursor = 0;
  let result = "";
  let match = codePattern.exec(text);

  while (match) {
    result += text.slice(cursor, match.index).replace(namePattern, linkMessageName);
    const codeBody = match[2];
    result += knownNames.has(codeBody)
      ? `[\`${codeBody}\`](${messageAnchor(codeBody)})`
      : match[0];
    cursor = match.index + match[0].length;
    match = codePattern.exec(text);
  }

  return result + text.slice(cursor).replace(namePattern, linkMessageName);
}

function linkMessageName(name) {
  return `[${name}](${messageAnchor(name)})`;
}

function isStructured(schema) {
  const normalized = normalizeSchema(schema);
  if (!normalized || typeof normalized !== "object") return false;
  if (normalized.properties && Object.keys(normalized.properties).length > 0) {
    return true;
  }
  return Boolean(normalized.items && isStructured(normalized.items));
}

function makeRow(path, schema, isRequired, localeLabels) {
  const normalized = normalizeSchema(schema);
  return {
    path,
    type: typeName(normalized, localeLabels),
    required: isRequired,
    description: describeSchema(normalized, localeLabels),
  };
}

function renderTable(rows, localeLabels) {
  if (rows.length === 0) return "";
  const header = `| ${localeLabels.columns.join(" | ")} |`;
  const separator = `| ${localeLabels.columns.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => {
    const type = formatCell(row.type, localeLabels);
    const description = formatCell(row.description, localeLabels);
    const required = row.required ? localeLabels.yes : localeLabels.no;
    return `| \`${row.path}\` | ${type} | ${required} | ${description} |`;
  });
  return [header, separator, ...body].join("\n");
}

function dependencyNotes(schema, basePath, localeLabels) {
  const dependencies = schema?.dependencies;
  if (!dependencies || Array.isArray(dependencies)) return [];

  const seen = new Set();
  const notes = [];
  for (const [key, requires] of Object.entries(dependencies)) {
    const companions = Array.isArray(requires) ? requires : [];
    for (const companion of companions) {
      const pair = [joinPath(basePath, key), joinPath(basePath, companion)]
        .sort()
        .join("|");
      if (seen.has(pair)) continue;
      seen.add(pair);
      notes.push(
        localeLabels.pair(joinPath(basePath, key), joinPath(basePath, companion))
      );
    }
  }
  return notes;
}

function conditionClauses(ifSchema, basePath) {
  const clauses = [];

  function walk(properties, prefix) {
    if (!properties || typeof properties !== "object") return;
    for (const [key, value] of Object.entries(properties)) {
      const propertyPath = joinPath(prefix, key);
      if (Array.isArray(value?.enum) || value?.const !== undefined) {
        clauses.push({
          path: joinPath(basePath, propertyPath),
          values: value.enum ?? [value.const],
        });
      } else if (value?.properties) {
        walk(value.properties, propertyPath);
      }
    }
  }

  walk(ifSchema?.properties, "");
  return clauses;
}

function formatCondition(ifSchema, basePath, localeLabels) {
  const clauses = conditionClauses(ifSchema, basePath).map((clause) =>
    localeLabels.conditionClause(
      clause.path,
      clause.values.map(formatLiteral)
    )
  );
  return clauses.join(localeLabels.conditionJoiner);
}

function renderCollapsedStructure(summary, body) {
  const summaryHtml = summary.replace(/`([^`]+)`/g, "<code>$1</code>");
  return `<details className="message-structure-details">\n<summary>${summaryHtml}</summary>\n\n${body}\n\n</details>`;
}

function renderConditionals(conditionals, basePath, localeLabels) {
  if (!conditionals?.length) return [];
  const blocks = [];

  for (const conditional of conditionals) {
    const condition = formatCondition(conditional.if, basePath, localeLabels);
    if (!condition) continue;
    const thenSchema = normalizeSchema(conditional.then ?? {});
    const required = new Set(thenSchema.required ?? []);
    const structured = new Set();

    for (const [name, propertySchema] of Object.entries(thenSchema.properties ?? {})) {
      const propertyPath = joinPath(basePath, name);
      const normalized = normalizeSchema(propertySchema);
      if (!isStructured(normalized)) {
        const detail = describeSchema(normalized, localeLabels);
        if (detail) {
          blocks.push(
            localeLabels.fieldNote(propertyPath, escapeMdxInline(detail))
          );
        }
        continue;
      }

      structured.add(name);
      const collected = collectSchema(normalized, propertyPath, localeLabels);
      const summary = localeLabels.variantIntro(
        condition,
        propertyPath,
        required.has(name),
        normalized.schemaName
      );
      const body = [
        normalized.description?.trim()
          ? escapeMdxInline(normalized.description.trim())
          : "",
        renderTable(collected.rows, localeLabels),
        ...collected.notes,
        ...collected.blocks,
      ]
        .filter(Boolean)
        .join("\n\n");
      blocks.push(renderCollapsedStructure(summary, body));
    }

    const plainRequired = [...required].filter((name) => !structured.has(name));
    if (plainRequired.length > 0) {
      blocks.push(
        localeLabels.conditionalRequired(
          condition,
          plainRequired.map((name) => `\`${joinPath(basePath, name)}\``)
        )
      );
    }
  }

  return blocks;
}

function collectSchema(schema, basePath, localeLabels) {
  const normalized = normalizeSchema(schema);
  const rows = [];
  const notes = dependencyNotes(normalized, basePath, localeLabels);
  const blocks = [];
  const required = new Set(normalized.required ?? []);

  for (const [key, propertySchema] of Object.entries(normalized.properties ?? {})) {
    const nested = appendProperty(
      key,
      propertySchema,
      required.has(key),
      basePath,
      localeLabels
    );
    rows.push(...nested.rows);
    notes.push(...nested.notes);
    blocks.push(...nested.blocks);
  }

  blocks.push(
    ...renderConditionals(normalized.conditionals, basePath, localeLabels)
  );

  return {rows, notes, blocks};
}

function appendProperty(key, schema, isRequired, parentPath, localeLabels) {
  const normalized = normalizeSchema(schema);
  const propertyPath = joinPath(parentPath, key);
  const rows = [makeRow(propertyPath, normalized, isRequired, localeLabels)];
  const notes = [];
  const blocks = [];

  if (normalized.properties || normalized.conditionals || normalized.dependencies) {
    const collected = collectSchema(normalized, propertyPath, localeLabels);
    rows.push(...collected.rows);
    notes.push(...collected.notes);
    blocks.push(...collected.blocks);
  }

  if (normalized.items && isStructured(normalized.items)) {
    const collected = collectSchema(
      normalized.items,
      `${propertyPath}[]`,
      localeLabels
    );
    rows.push(...collected.rows);
    notes.push(...collected.notes);
    blocks.push(...collected.blocks);
  }

  if (isStructured(normalized.additionalProperties)) {
    const collected = collectSchema(
      normalized.additionalProperties,
      `${propertyPath}.*`,
      localeLabels
    );
    rows.push(...collected.rows);
    notes.push(...collected.notes);
    blocks.push(...collected.blocks);
  }

  return {rows, notes, blocks};
}

function renderParameters(payload, localeLabels) {
  if (!payload || typeof payload !== "object") return localeLabels.emptyParameters;
  const collected = collectSchema(payload, "", localeLabels);
  if (
    collected.rows.length === 0 &&
    collected.notes.length === 0 &&
    collected.blocks.length === 0
  ) {
    return localeLabels.emptyParameters;
  }

  return [
    renderTable(collected.rows, localeLabels),
    ...collected.notes,
    ...collected.blocks,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function renderDescription(message, payload, localeLabels) {
  const paragraphs = [];
  const seen = [];
  const add = (text) => {
    const trimmed = typeof text === "string" ? text.trim() : "";
    if (!trimmed) return;
    if (seen.some((item) => item === trimmed || item.includes(trimmed))) return;
    const containingIndex = seen.findIndex((item) => trimmed.includes(item));
    if (containingIndex >= 0) {
      seen[containingIndex] = trimmed;
      return;
    }
    seen.push(trimmed);
  };

  add(message?.summary);
  add(message?.description);
  add(payload?.description);

  if (message?.title?.trim()) {
    paragraphs.push(`**${escapeMdxInline(message.title.trim())}**`);
  }
  paragraphs.push(...seen.map((paragraph) => escapeMdxInline(paragraph)));

  return paragraphs.length > 0
    ? paragraphs.join("\n\n")
    : localeLabels.emptyDescription;
}

function jsxAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderExampleCode(example) {
  const payload = example?.payload ?? example?.value ?? example;
  const summary = example?.summary?.trim()
    ? `${escapeMdxInline(example.summary.trim())}\n\n`
    : "";
  return `${summary}\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\``;
}

function renderExamples(messageName, message, localeLabels) {
  const examples = Array.isArray(message?.examples) ? message.examples : [];
  if (examples.length === 0) return "";

  const heading = `### ${localeLabels.exampleHeading}`;
  if (examples.length === 1) {
    const example = examples[0];
    const title = example?.name
      ? `**${escapeMdxInline(String(example.name))}**\n\n`
      : "";
    return `${heading}\n\n${title}${renderExampleCode(example)}`;
  }

  const tabs = examples.map((example, index) => {
    const label = example?.name?.trim()
      ? example.name.trim()
      : localeLabels.exampleLabel(index + 1);
    return `<TabItem value="${messageName}-${index + 1}" label="${jsxAttribute(label)}">\n\n${renderExampleCode(example)}\n\n</TabItem>`;
  });

  return `${heading}\n\n<ExampleTabs>\n${tabs.join("\n")}\n</ExampleTabs>`;
}

function renderDocument(document, localeLabels) {
  const messages = document?.components?.messages;
  if (!messages || typeof messages !== "object" || Array.isArray(messages)) {
    throw new Error("AsyncAPI document is missing components.messages");
  }

  const labelsForDocument = {
    ...localeLabels,
    messageNames: Object.keys(messages).sort((left, right) => right.length - left.length),
  };
  const usesTabs = Object.values(messages).some(
    (message) => Array.isArray(message?.examples) && message.examples.length > 1
  );
  const tabImports = usesTabs
    ? "import ExampleTabs from '@site/src/components/ExampleTabs';\nimport TabItem from '@theme/TabItem';\n\n"
    : "";
  const sections = Object.entries(messages).map(([name, message]) => {
    const payload = message?.payload
      ? resolveSchema(document, message.payload)
      : null;
    const examples = renderExamples(name, message, labelsForDocument);
    return [
      `## ${name}`,
      "",
      `### ${localeLabels.descriptionHeading}`,
      "",
      renderDescription(message, payload, labelsForDocument),
      "",
      `### ${labelsForDocument.parametersHeading}`,
      "",
      renderParameters(payload, labelsForDocument),
      ...(examples ? ["", examples] : []),
    ].join("\n");
  });

  return `---
title: "${localeLabels.title}"
description: "${localeLabels.frontDescription}"
sidebar_label: "${localeLabels.title}"
---

{/* Generated by scripts/generate-websocket-message-structure.mjs. Do not edit by hand. */}

${tabImports}# ${localeLabels.title}

${sections.join("\n\n")}
`;
}

for (const target of targets) {
  const document = yaml.load(fs.readFileSync(target.input, "utf8"));
  const localeLabels = labels[target.locale];
  const source = renderDocument(document, localeLabels);
  fs.mkdirSync(path.dirname(target.output), {recursive: true});
  fs.writeFileSync(target.output, source);
  const messageCount = Object.keys(document.components.messages).length;
  console.log(
    `Generated ${path.relative(rootDir, target.output)} (${messageCount} messages)`
  );
}
