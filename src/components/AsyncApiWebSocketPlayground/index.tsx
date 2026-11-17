import BrowserOnly from "@docusaurus/BrowserOnly";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import clsx from "clsx";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import OpenApiSchema from "@theme/Schema";

import CloseEyeIcon from "@site/src/icons/CloseEye.svg";
import OpenEyeIcon from "@site/src/icons/OpenEye.svg";
import styles from "./styles.module.css";
import {
  getPlaygroundSpec,
  type JsonSchema,
  type MessageDefinition,
  type PlaygroundSpec,
} from "./spec";

type LogLevel = "system" | "sent" | "received" | "error";

type LogEntry = {
  id: string;
  level: LogLevel;
  title: string;
  content: string;
  timestamp: string;
};

type ConnectionHelp = {
  title: string;
  summary: string;
  hints: string[];
  rawBodyTitle?: string;
  rawBody?: string;
  rawBodyNote?: string;
};

type ClientProps = {
  className?: string;
};

type UiCopy = {
  step: (index: number) => string;
  connect: string;
  auth: string;
  keepalive: string;
  sendMessages: string;
  receiveMessages: string;
  serverPreset: string;
  protocol: string;
  host: string;
  path: string;
  connectButton: string;
  disconnectButton: string;
  clearLogsButton: string;
  connectIntro: string;
  authIntro: string;
  token: string;
  tokenPlaceholder: string;
  hideToken: string;
  showToken: string;
  autoAuth: string;
  sendAuthRequest: string;
  keepaliveTitle: string;
  keepaliveIntro: string;
  sendPingRequest: string;
  autoPing: string;
  parameters: string;
  examples: string;
  expandExamples: string;
  collapseExamples: string;
  sendCurrentMessage: string;
  serverReturnPush: string;
  realtimeLogs: string;
  entries: string;
  emptyLogs: string;
  loadFailureTitle: string;
  loadFailureSummary: (endpointUrl: string) => string;
  loadFailureHints: (endpointUrl: string, protocol: "ws" | "wss", pathname: string, code?: number) => string[];
  loadFailureBody: string;
  probingBody: string;
  probingBodyNote: string;
  bodyProbeResult: (probeUrl: string, status: number, statusText: string) => string;
  bodyProbeFailure: string;
  hostRequired: string;
  sendPingFailed: string;
  sendAuthFailed: string;
  websocketNotConnected: string;
  startingConnection: string;
  startingConnectionHint: (endpointUrl: string) => string;
  connectionSucceeded: string;
  receivedMessage: string;
  connectionError: string;
  connectionErrorHint: string;
  connectionClosed: string;
  connectionFailed: string;
  sendMessagePrefix: string;
  jsonParseFailed: string;
  pageUnload: string;
  loading: string;
};

const uiCopy: Record<"zh" | "en", UiCopy> = {
  zh: {
    step: (index) => `第 ${index} 步`,
    connect: "连接",
    auth: "鉴权",
    keepalive: "保持 WebSocket 连接",
    sendMessages: "发送消息",
    receiveMessages: "接收消息",
    serverPreset: "服务预设",
    protocol: "协议",
    host: "Host",
    path: "Path",
    connectButton: "Connect",
    disconnectButton: "Disconnect",
    clearLogsButton: "Clear Logs",
    connectIntro: "推荐先连接，再通过首包 AuthRequest 完成鉴权。",
    authIntro:
      "浏览器环境无法直接设置握手 Authorization Header，因此，请在连接成功后 7 秒内输入从 Aqara Studio 获取的 Token（Bearer 前缀将自动补全），发送 AuthRequest，以首包鉴权的方式完成鉴权。否则 WebSocket 连接将被中断。",
    token: "Token",
    tokenPlaceholder: "填入从 Aqara Studio 获取的 Token，Bearer 前缀将自动补全",
    hideToken: "隐藏 Token",
    showToken: "显示 Token",
    autoAuth: "连接成功后自动发送 AuthRequest",
    sendAuthRequest: "发送 AuthRequest",
    keepaliveTitle: "连接保活",
    keepaliveIntro:
      "若需保持 WebSocket 长时间连接，请在业务空闲时每隔 30 秒主动发送一次 ping 消息。您可使用本页的 Send PingRequest 快捷按钮，方便测试保活机制。",
    sendPingRequest: "发送 PingRequest",
    autoPing: "每 30 秒自动发送 PingRequest",
    parameters: "参数",
    examples: "示例",
    expandExamples: "展开",
    collapseExamples: "折叠",
    sendCurrentMessage: "发送当前消息",
    serverReturnPush: "服务端返回 / 推送",
    realtimeLogs: "实时日志",
    entries: "entries",
    emptyLogs: "连接后收发的消息会按时间倒序显示在这里，便于直接验证鉴权、订阅和推送行为。",
    loadFailureTitle: "解释为什么 connect 失败",
    loadFailureSummary: () => "浏览器未收到可用的 WebSocket 握手结果，因此连接没有建立成功。请优先检查地址、协议、路径和证书配置。",
    loadFailureHints: (endpointUrl, protocol, pathname, code) => {
      const hints = [
        `确认当前地址 ${endpointUrl} 可被浏览器访问，尤其是 Host 和 Path 是否与 Studio 实际暴露的一致。`,
      ];
      if (protocol === "wss") {
        hints.push("如果目标服务只开启了明文 WebSocket，请将协议切换为 ws。");
        hints.push("如果使用 wss，请确认 HTTPS / TLS 证书可被当前浏览器信任。");
      } else {
        hints.push("如果服务通过 HTTPS 反向代理暴露，通常应改用 wss。");
      }
      if (pathname !== "/open/ws") {
        hints.push("若不确定 Path，建议先恢复为文档默认值 /open/ws 再测试。");
      }
      if (code === 1006 || code === 0 || code === undefined) {
        hints.push("浏览器常见的连接失败不会返回精确错误正文；这通常意味着服务不可达、协议不匹配、证书异常，或服务端主动拒绝握手。");
      }
      return hints;
    },
    loadFailureBody: "失败时返回的 body",
    probingBody: "正在尝试读取服务端返回内容…",
    probingBodyNote: "浏览器原生 WebSocket API 不会直接暴露握手失败的 body，本页正在做一次额外探测。",
    bodyProbeResult: (probeUrl, status, statusText) => `这是对 ${probeUrl} 发起的 HTTP 探测结果，状态码 ${status} ${statusText}。它只在服务端允许普通 HTTP 读取时可见，不一定等同于 WebSocket Upgrade 握手失败的原始 body。`,
    bodyProbeFailure: "浏览器无法直接读取 WebSocket 握手失败的 response body；本页已尝试用同地址 HTTP 探测获取返回内容，但当前请求也无法读取，常见原因是跨域策略、目标服务不支持普通 HTTP 访问，或网络层直接拦截。",
    hostRequired: "Host 不能为空，请先填写可访问的域名或 IP。",
    sendPingFailed: "发送 PingRequest",
    sendAuthFailed: "发送 AuthRequest",
    websocketNotConnected: "WebSocket 尚未连接。",
    startingConnection: "开始连接",
    startingConnectionHint: (endpointUrl) => `准备连接 ${endpointUrl}\n提示：浏览器原生 WebSocket 不支持自定义 Authorization 握手 Header，本页面使用首包 AuthRequest 调试。`,
    connectionSucceeded: "连接成功",
    receivedMessage: "收到消息",
    connectionError: "连接异常",
    connectionErrorHint: "浏览器触发 websocket error 事件，请结合控制台和服务端日志排查。",
    connectionClosed: "连接关闭",
    connectionFailed: "连接失败",
    sendMessagePrefix: "发送",
    jsonParseFailed: "JSON 解析失败",
    pageUnload: "页面卸载",
    loading: "Loading WebSocket playground…",
  },
  en: {
    step: (index) => `Step ${index}`,
    connect: "Connect",
    auth: "Authenticate",
    keepalive: "Keep the WebSocket Connection Alive",
    sendMessages: "Send Messages",
    receiveMessages: "Receive Messages",
    serverPreset: "Server Preset",
    protocol: "Protocol",
    host: "Host",
    path: "Path",
    connectButton: "Connect",
    disconnectButton: "Disconnect",
    clearLogsButton: "Clear Logs",
    connectIntro: "Connect first, then complete authentication with the initial AuthRequest message.",
    authIntro:
      "The browser environment cannot set the Authorization header during the WebSocket handshake. After the connection succeeds, enter the token obtained from Aqara Studio within 7 seconds (the Bearer prefix will be added automatically), then send AuthRequest to complete first-message authentication. Otherwise, the WebSocket connection will be interrupted.",
    token: "Token",
    tokenPlaceholder: "Enter the token obtained from Aqara Studio; the Bearer prefix will be added automatically",
    hideToken: "Hide token",
    showToken: "Show token",
    autoAuth: "Automatically send AuthRequest after connection succeeds",
    sendAuthRequest: "Send AuthRequest",
    keepaliveTitle: "Connection Keepalive",
    keepaliveIntro:
      "To keep the WebSocket connection alive for a long time, proactively send a ping message every 30 seconds during idle periods. You can use the Send PingRequest shortcut button on this page to test the keepalive mechanism.",
    sendPingRequest: "Send PingRequest",
    autoPing: "Automatically send PingRequest every 30 seconds",
    parameters: "Parameters",
    examples: "Examples",
    expandExamples: "Show all",
    collapseExamples: "Collapse",
    sendCurrentMessage: "Send Current Message",
    serverReturnPush: "Server Responses / Push Messages",
    realtimeLogs: "Realtime Logs",
    entries: "entries",
    emptyLogs: "Messages sent and received after connection will appear here in reverse chronological order so you can verify authentication, subscriptions, and push behavior immediately.",
    loadFailureTitle: "Why connect failed",
    loadFailureSummary: () => "The browser did not receive a usable WebSocket handshake result, so the connection was not established. Check the address, protocol, path, and certificate configuration first.",
    loadFailureHints: (endpointUrl, protocol, pathname, code) => {
      const hints = [
        `Confirm that ${endpointUrl} is reachable from the browser, especially that Host and Path match the actual Studio endpoint.`,
      ];
      if (protocol === "wss") {
        hints.push("If the target service only exposes plain WebSocket, switch the protocol to ws.");
        hints.push("If you use wss, confirm that the HTTPS / TLS certificate is trusted by the current browser.");
      } else {
        hints.push("If the service is exposed through an HTTPS reverse proxy, you usually need to switch to wss.");
      }
      if (pathname !== "/open/ws") {
        hints.push("If you are unsure about the Path value, try restoring the default contract path /open/ws first.");
      }
      if (code === 1006 || code === 0 || code === undefined) {
        hints.push("Common browser connection failures do not return an exact error body. This usually means the service is unreachable, the protocol does not match, the certificate is invalid, or the server rejected the handshake.");
      }
      return hints;
    },
    loadFailureBody: "Response body on failure",
    probingBody: "Trying to read the server response…",
    probingBodyNote: "The native browser WebSocket API does not expose the handshake-failure body directly. This page is performing an additional probe.",
    bodyProbeResult: (probeUrl, status, statusText) => `This is the result of an HTTP probe sent to ${probeUrl}, with status ${status} ${statusText}. It is only visible when the server allows plain HTTP reads and may not match the original WebSocket Upgrade failure body.`,
    bodyProbeFailure: "The browser cannot directly read the response body of a failed WebSocket handshake. This page attempted to probe the same address over HTTP, but the result is still unavailable. Common reasons include CORS policy, the target service not supporting plain HTTP access, or interception at the network layer.",
    hostRequired: "Host cannot be empty. Enter a reachable host or IP address first.",
    sendPingFailed: "Send PingRequest",
    sendAuthFailed: "Send AuthRequest",
    websocketNotConnected: "WebSocket is not connected yet.",
    startingConnection: "Starting connection",
    startingConnectionHint: (endpointUrl) => `Preparing to connect to ${endpointUrl}\nNote: the native browser WebSocket API does not allow custom Authorization handshake headers, so this page uses the first-message AuthRequest flow for debugging.`,
    connectionSucceeded: "Connection established",
    receivedMessage: "Received message",
    connectionError: "Connection error",
    connectionErrorHint: "The browser emitted a websocket error event. Please inspect the console output and server logs for details.",
    connectionClosed: "Connection closed",
    connectionFailed: "Connection failed",
    sendMessagePrefix: "Send",
    jsonParseFailed: "JSON parse failed",
    pageUnload: "Page unload",
    loading: "Loading WebSocket playground…",
  },
};

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function ensureBearerToken(token: string) {
  const trimmed = token.trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.startsWith("Bearer ") ? trimmed : `Bearer ${trimmed}`;
}

function sectionHeading(step: string, title: string) {
  return (
    <div>
      <p className={styles.stepEyebrow}>{step}</p>
      <h3>{title}</h3>
    </div>
  );
}

function EyeButtonIcon({ open }: { open: boolean }) {
  const Icon = open ? OpenEyeIcon : CloseEyeIcon;
  return <Icon aria-hidden="true" focusable="false" />;
}

function createMsgId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createSchemaTemplate(schema?: JsonSchema): unknown {
  if (!schema) {
    return null;
  }

  if (schema.default !== undefined) {
    return deepClone(schema.default);
  }

  if (schema.enum?.length) {
    return schema.enum[0];
  }

  const schemaType = Array.isArray(schema.type)
    ? schema.type.find((item) => item !== "null")
    : schema.type;

  if (schemaType === "object") {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(schema.properties ?? {})) {
      result[key] = createSchemaTemplate(value);
    }

    return result;
  }

  if (schemaType === "array") {
    if (!schema.items) {
      return [];
    }

    const itemTemplate = createSchemaTemplate(schema.items);
    return itemTemplate === null ? [] : [itemTemplate];
  }

  if (schemaType === "integer" || schemaType === "number") {
    return 0;
  }

  if (schemaType === "boolean") {
    return false;
  }

  if (schemaType === "string") {
    return "";
  }

  if (Array.isArray(schema.type) && schema.type.includes("null")) {
    return null;
  }

  return null;
}

function normalizeMessagePayload(messageKey: string, payload: unknown, auth: AuthDraft) {
  const normalized = deepClone(payload) as Record<string, unknown>;

  if (typeof normalized !== "object" || normalized === null) {
    return payload;
  }

  if ("msgId" in normalized) {
    normalized.msgId = createMsgId();
  }

  if (messageKey === "AuthRequest") {
    const data = (normalized.data ?? {}) as Record<string, unknown>;
    data.authType = "token";
    data.token = ensureBearerToken(auth.token) || "Bearer <Token>";
    normalized.data = data;
  }

  return normalized;
}

function buildTemplate(messageKey: string, message: MessageDefinition, auth: AuthDraft) {
  const fromExample = message.examples[0]?.payload;
  const template = fromExample ?? createSchemaTemplate(message.payloadSchema);
  return normalizeMessagePayload(messageKey, template, auth);
}

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function tryFormatJsonText(text: string) {
  try {
    return prettyJson(JSON.parse(text));
  } catch {
    return text;
  }
}

function toHttpProbeUrl(endpointUrl: string) {
  if (endpointUrl.startsWith("wss://")) {
    return endpointUrl.replace("wss://", "https://");
  }

  if (endpointUrl.startsWith("ws://")) {
    return endpointUrl.replace("ws://", "http://");
  }

  return endpointUrl;
}

function createConnectionHelp({
  endpointUrl,
  protocol,
  host,
  pathname,
  reason,
  code,
  ui,
}: {
  endpointUrl: string;
  protocol: "ws" | "wss";
  host: string;
  pathname: string;
  reason?: string;
  code?: number;
  ui: UiCopy;
}): ConnectionHelp {
  const hints = ui.loadFailureHints(endpointUrl, protocol, pathname, code);
  if (!host.trim()) {
    hints.unshift(ui.hostRequired);
  }

  return {
    title: ui.loadFailureTitle,
    summary: reason || ui.loadFailureSummary(endpointUrl),
    hints,
  };
}

async function probeConnectFailureBody({
  endpointUrl,
  token,
  ui,
}: {
  endpointUrl: string;
  token?: string;
  ui: UiCopy;
}) {
  const probeUrl = toHttpProbeUrl(endpointUrl);
  const headers = new Headers({
    Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
  });

  if (token?.trim()) {
    headers.set("Authorization", ensureBearerToken(token));
  }

  try {
    const response = await fetch(probeUrl, {
      method: "GET",
      headers,
    });

    const text = await response.text();
    const formattedBody = text ? tryFormatJsonText(text) : "(empty body)";

    return {
      rawBodyTitle: ui.loadFailureBody,
      rawBody: formattedBody,
      rawBodyNote: ui.bodyProbeResult(probeUrl, response.status, response.statusText),
    };
  } catch (error) {
    return {
      rawBodyTitle: ui.loadFailureBody,
      rawBody:
        error instanceof Error
          ? error.message
          : String(error),
      rawBodyNote: ui.bodyProbeFailure,
    };
  }
}

function toOpenApiSchema(schema?: JsonSchema): Record<string, unknown> {
  if (!schema) {
    return { type: "object", properties: {} };
  }

  const rawTypes = Array.isArray(schema.type)
    ? schema.type.filter(Boolean)
    : schema.type
      ? [schema.type]
      : [];
  const nullable = rawTypes.includes("null");
  const normalizedTypes = rawTypes.filter((item) => item !== "null");
  const normalizedType =
    normalizedTypes.length <= 1 ? normalizedTypes[0] : normalizedTypes;

  const converted: Record<string, unknown> = {};

  if (schema.title) {
    converted.title = schema.title;
  }

  if (normalizedType) {
    converted.type = normalizedType;
  }

  if (nullable) {
    converted.nullable = true;
  }

  if (schema.description) {
    converted.description = schema.description;
  }

  if (schema.enum) {
    converted.enum = schema.enum;
  }

  if (schema.default !== undefined) {
    converted.default = schema.default;
  }

  if (schema.format) {
    converted.format = schema.format;
  }

  if (schema.required) {
    converted.required = schema.required;
  }

  if (schema.minLength !== undefined) {
    converted.minLength = schema.minLength;
  }

  if (schema.maxLength !== undefined) {
    converted.maxLength = schema.maxLength;
  }

  if (schema.properties) {
    converted.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => [
        key,
        toOpenApiSchema(value),
      ])
    );
  }

  if (schema.items) {
    converted.items = toOpenApiSchema(schema.items);
  }

  if (schema.additionalProperties !== undefined) {
    converted.additionalProperties = schema.additionalProperties;
  }

  if (schema.oneOf) {
    converted.oneOf = schema.oneOf.map(toOpenApiSchema);
  }

  if (schema.anyOf) {
    converted.anyOf = schema.anyOf.map(toOpenApiSchema);
  }

  return converted;
}

function exampleChipsOverflow(list: HTMLElement) {
  const items = Array.from(list.querySelectorAll<HTMLElement>("button"));
  if (items.length === 0) {
    return false;
  }
  const gap = Number.parseFloat(getComputedStyle(list).columnGap) || 0;
  const total = items.reduce(
    (sum, item, index) => sum + item.getBoundingClientRect().width + (index > 0 ? gap : 0),
    0,
  );
  return total > list.clientWidth + 1;
}

function ExamplePicker({
  examples,
  selectedName,
  expandLabel,
  collapseLabel,
  onSelect,
}: {
  examples: {name: string}[];
  selectedName: string;
  expandLabel: string;
  collapseLabel: string;
  onSelect: (name: string) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) {
      return undefined;
    }
    const measure = () => setOverflowing(exampleChipsOverflow(list));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [examples]);

  useLayoutEffect(() => {
    setExpanded(false);
  }, [examples]);

  useLayoutEffect(() => {
    if (!overflowing) {
      setExpanded(false);
    }
  }, [overflowing]);

  const showToggle = overflowing || expanded;

  return (
    <div className={styles.exampleTabsRow}>
      <div
        ref={listRef}
        className={clsx(styles.exampleTabs, expanded && styles.exampleTabsExpanded)}
      >
        {examples.map((example) => (
          <button
            key={example.name}
            className={clsx(styles.inlineTag, {
              [styles.inlineTagActive]: selectedName === example.name,
            })}
            type="button"
            onClick={() => onSelect(example.name)}
          >
            {example.name}
          </button>
        ))}
      </div>
      {showToggle ? (
        <button
          type="button"
          className={styles.exampleTabsToggle}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          <svg
            className={clsx(styles.exampleTabsCaret, expanded && styles.exampleTabsCaretUp)}
            viewBox="0 0 12 8"
            aria-hidden="true"
          >
            <path d="M1 1h10L6 7z" fill="currentColor" />
          </svg>
          {expanded ? collapseLabel : expandLabel}
        </button>
      ) : null}
    </div>
  );
}

function SchemaReference({
  schema,
  schemaType,
}: {
  schema: JsonSchema;
  schemaType: "request" | "response";
}) {
  return (
    <div className={styles.openapiSchemaWrap}>
      <OpenApiSchema schema={toOpenApiSchema(schema)} schemaType={schemaType} />
    </div>
  );
}

type AuthDraft = {
  token: string;
};

function PlaygroundClient({ className }: ClientProps) {
  const { i18n } = useDocusaurusContext();
  const spec = useMemo(
    (): PlaygroundSpec => getPlaygroundSpec(i18n.currentLocale),
    [i18n.currentLocale],
  );
  const ui = i18n.currentLocale === "zh" ? uiCopy.zh : uiCopy.en;
  const initialServer = spec.servers[1] ?? spec.servers[0];
  const socketRef = useRef<WebSocket | null>(null);
  const keepaliveIntervalRef = useRef<number | null>(null);
  const sendEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const connectionAttemptRef = useRef({
    opened: false,
    manualClose: false,
  });
  const [serverId, setServerId] = useState(initialServer.id);
  const [protocol, setProtocol] = useState<"ws" | "wss">(initialServer.protocol);
  const [host, setHost] = useState(initialServer.hostDefault);
  const [pathname, setPathname] = useState(initialServer.pathname);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sendDraft, setSendDraft] = useState("");
  const [selectedSendMessage, setSelectedSendMessage] = useState("AuthRequest");
  const [selectedSendExampleName, setSelectedSendExampleName] = useState("");
  const [receivePreview, setReceivePreview] = useState("");
  const [selectedReceiveMessage, setSelectedReceiveMessage] = useState("AuthResponse");
  const [selectedReceiveExampleName, setSelectedReceiveExampleName] = useState("");
  const [connectionState, setConnectionState] = useState("idle");
  const [connectionHelp, setConnectionHelp] = useState<ConnectionHelp | null>(null);
  const [auth, setAuth] = useState<AuthDraft>({
    token: "",
  });
  const [showToken, setShowToken] = useState(false);
  const [autoAuthOnConnect, setAutoAuthOnConnect] = useState(true);
  const [autoPingKeepalive, setAutoPingKeepalive] = useState(true);

  async function enrichConnectionHelpWithProbe(baseHelp: ConnectionHelp) {
    const probe = await probeConnectFailureBody({
      endpointUrl,
      token: auth.token,
      ui,
    });

    setConnectionHelp((current) => {
      if (!current || current.summary !== baseHelp.summary) {
        return current;
      }

      return {
        ...current,
        ...probe,
      };
    });
  }

  const endpointUrl = useMemo(() => {
    const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return `${protocol}://${host.trim()}${normalizedPath}`;
  }, [host, pathname, protocol]);

  const sendMessages = useMemo(() => {
    const names = new Set<string>();
    for (const operation of spec.operations) {
      if (operation.action !== "send") continue;
      for (const message of operation.messages) names.add(message);
    }
    return [...names];
  }, [spec]);

  const receiveMessages = useMemo(() => {
    const names = new Set<string>();
    for (const operation of spec.operations) {
      if (operation.action !== "receive") continue;
      for (const message of operation.messages) names.add(message);
    }
    return [...names];
  }, [spec]);

  function appendLog(level: LogLevel, title: string, content: string) {
    setLogs((current) => [
      {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        level,
        title,
        content,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...current,
    ]);
  }

  function clearKeepaliveInterval() {
    if (keepaliveIntervalRef.current !== null) {
      window.clearInterval(keepaliveIntervalRef.current);
      keepaliveIntervalRef.current = null;
    }
  }

  function sendPingRequest(label = ui.sendPingFailed) {
    sendPayload(
      buildTemplate("PingRequest", spec.messages.PingRequest, auth),
      label
    );
  }

  function sendAuthRequest(label = ui.sendAuthFailed) {
    sendPayload(
      buildTemplate("AuthRequest", spec.messages.AuthRequest, auth),
      label
    );
  }

  function startKeepaliveInterval() {
    clearKeepaliveInterval();

    if (
      !autoPingKeepalive ||
      socketRef.current?.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    keepaliveIntervalRef.current = window.setInterval(() => {
      if (socketRef.current?.readyState !== WebSocket.OPEN) {
        clearKeepaliveInterval();
        return;
      }

      sendPingRequest(`${ui.sendPingFailed} (auto)`);
    }, 30000);
  }

  function disconnectSocket(reason = ui.disconnectButton, manual = false) {
    const current = socketRef.current;
    if (!current) {
      clearKeepaliveInterval();
      return;
    }

    connectionAttemptRef.current.manualClose = manual;
    clearKeepaliveInterval();
    current.close(1000, reason);
    socketRef.current = null;
  }

  function loadSendMessageDraft(messageKey: string, exampleName?: string) {
    const message = spec.messages[messageKey];
    if (!message) {
      return;
    }

    const example =
      message.examples.find((item) => item.name === exampleName) ?? message.examples[0];
    const nextPayload = example
      ? normalizeMessagePayload(messageKey, example.payload, auth)
      : buildTemplate(messageKey, message, auth);

    setSelectedSendMessage(messageKey);
    setSelectedSendExampleName(example?.name ?? "");
    setSendDraft(prettyJson(nextPayload));
  }

  function loadReceiveMessagePreview(messageKey: string, exampleName?: string) {
    const message = spec.messages[messageKey];
    if (!message) {
      return;
    }

    const example =
      message.examples.find((item) => item.name === exampleName) ?? message.examples[0];
    const nextPayload = example
      ? normalizeMessagePayload(messageKey, example.payload, auth)
      : buildTemplate(messageKey, message, auth);

    setSelectedReceiveMessage(messageKey);
    setSelectedReceiveExampleName(example?.name ?? "");
    setReceivePreview(prettyJson(nextPayload));
  }

  function updateServer(serverIdValue: string) {
    const nextServer =
      spec.servers.find((item) => item.id === serverIdValue) ??
      spec.servers[0];

    setServerId(nextServer.id);
    setProtocol(nextServer.protocol);
    setHost(nextServer.hostDefault);
    setPathname(nextServer.pathname);
  }

  function sendPayload(payload: unknown, label: string) {
    const current = socketRef.current;

    if (!current || current.readyState !== WebSocket.OPEN) {
      appendLog("error", `${label} ${i18n.currentLocale === "zh" ? "失败" : "failed"}`, ui.websocketNotConnected);
      return;
    }

    const content = prettyJson(payload);
    current.send(content);
    appendLog("sent", label, content);
  }

  function connectSocket() {
    disconnectSocket();

    try {
      connectionAttemptRef.current = {
        opened: false,
        manualClose: false,
      };
      setConnectionState("connecting");
      setConnectionHelp(null);
      appendLog(
        "system",
        ui.startingConnection,
        ui.startingConnectionHint(endpointUrl)
      );

      const socket = new WebSocket(endpointUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        connectionAttemptRef.current.opened = true;
        setConnectionState("open");
        setConnectionHelp(null);
        appendLog("system", ui.connectionSucceeded, endpointUrl);

        if (autoAuthOnConnect) {
          sendAuthRequest(`${ui.sendAuthFailed} (auto)`);
        }

        startKeepaliveInterval();
      };

      socket.onmessage = (event) => {
        const content =
          typeof event.data === "string" ? event.data : "[binary websocket frame]";
        appendLog("received", ui.receivedMessage, content);
      };

      socket.onerror = () => {
        const baseHelp = {
          ...createConnectionHelp({
            endpointUrl,
            protocol,
            host,
            pathname,
            ui,
          }),
          rawBodyTitle: ui.loadFailureBody,
          rawBody: ui.probingBody,
          rawBodyNote: ui.probingBodyNote,
        };
        setConnectionHelp(baseHelp);
        void enrichConnectionHelpWithProbe(baseHelp);
        appendLog("error", ui.connectionError, ui.connectionErrorHint);
      };

      socket.onclose = (event) => {
        const wasManualClose = connectionAttemptRef.current.manualClose;
        const wasOpened = connectionAttemptRef.current.opened;
        setConnectionState("closed");
        clearKeepaliveInterval();
        socketRef.current = null;

        if (!wasManualClose && !wasOpened) {
          const baseHelp = {
            ...createConnectionHelp({
              endpointUrl,
              protocol,
              host,
              pathname,
              code: event.code,
              reason: event.reason || undefined,
              ui,
            }),
            rawBodyTitle: ui.loadFailureBody,
            rawBody: ui.probingBody,
            rawBodyNote: ui.probingBodyNote,
          };
          setConnectionHelp(baseHelp);
          void enrichConnectionHelpWithProbe(baseHelp);
        }

        appendLog(
          event.wasClean ? "system" : "error",
          ui.connectionClosed,
          `code=${event.code} reason=${event.reason || "(empty)"}`
        );
      };
      } catch (error) {
      setConnectionState("closed");
      const baseHelp = {
        ...createConnectionHelp({
          endpointUrl,
          protocol,
          host,
          pathname,
          reason: error instanceof Error ? error.message : String(error),
          ui,
        }),
        rawBodyTitle: ui.loadFailureBody,
        rawBody: ui.probingBody,
        rawBodyNote: ui.probingBodyNote,
      };
      setConnectionHelp(baseHelp);
      void enrichConnectionHelpWithProbe(baseHelp);
      appendLog("error", ui.connectionFailed, String(error));
    }
  }

  function sendDraftMessage() {
    try {
      const payload = JSON.parse(sendDraft);
      sendPayload(payload, `${ui.sendMessagePrefix} ${selectedSendMessage}`);
    } catch (error) {
      appendLog("error", ui.jsonParseFailed, String(error));
    }
  }

  useEffect(() => {
    loadSendMessageDraft("AuthRequest");
    loadReceiveMessagePreview("AuthResponse");

    return () => {
      clearKeepaliveInterval();
      disconnectSocket(ui.pageUnload);
    };
    // We only want the initial load here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec]);

  useEffect(() => {
    if (selectedSendMessage !== "AuthRequest") {
      return;
    }

    loadSendMessageDraft("AuthRequest", selectedSendExampleName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  useEffect(() => {
    const editor = sendEditorRef.current;
    if (!editor) {
      return;
    }

    editor.style.height = "auto";
    editor.style.height = `${editor.scrollHeight}px`;
  }, [sendDraft]);

  useEffect(() => {
    if (connectionState === "open") {
      startKeepaliveInterval();
    } else {
      clearKeepaliveInterval();
    }

    return () => {
      clearKeepaliveInterval();
    };
    // Keepalive scheduling depends on the toggle and connection state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPingKeepalive, connectionState]);

  return (
    <div className={clsx(styles.playground, className)}>
      <div className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>WebSocket Playground</p>
          <h2 className={styles.title}>{spec.title}</h2>
          <p className={styles.description}>{spec.description}</p>
        </div>
        <div className={styles.statusPanel}>
          <span
            className={clsx(styles.statusBadge, {
              [styles.statusOpen]: connectionState === "open",
              [styles.statusConnecting]: connectionState === "connecting",
              [styles.statusClosed]: connectionState === "closed",
            })}
          >
            {connectionState}
          </span>
          <code className={styles.endpointPreview}>{endpointUrl}</code>
        </div>
      </div>

      <div className={styles.mainColumns}>
        <div className={styles.stepsColumn}>
          <section className={styles.card}>
            {sectionHeading(ui.step(1), ui.connect)}
            <p className={styles.muted}>
              {ui.connectIntro}
            </p>
            <div className={styles.fieldGrid}>
              <label className={styles.field}>
                <span>{ui.serverPreset}</span>
                <select value={serverId} onChange={(event) => updateServer(event.target.value)}>
                  {spec.servers.map((server) => (
                    <option key={server.id} value={server.id}>
                      {server.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>{ui.protocol}</span>
                <select
                  value={protocol}
                  onChange={(event) => setProtocol(event.target.value as "ws" | "wss")}
                >
                  <option value="ws">ws</option>
                  <option value="wss">wss</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>{ui.host}</span>
                <input value={host} onChange={(event) => setHost(event.target.value)} />
              </label>
              <label className={styles.fieldWide}>
                <span>{ui.path}</span>
                <input value={pathname} onChange={(event) => setPathname(event.target.value)} />
              </label>
            </div>
            <div className={styles.actions}>
              <button className="button button--primary" type="button" onClick={connectSocket}>
                {ui.connectButton}
              </button>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => disconnectSocket(ui.disconnectButton, true)}
              >
                {ui.disconnectButton}
              </button>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => setLogs([])}
              >
                {ui.clearLogsButton}
              </button>
            </div>
            {connectionHelp ? (
              <div className={styles.connectionHelp} role="status" aria-live="polite">
                <strong className={styles.connectionHelpTitle}>{connectionHelp.title}</strong>
                <p className={styles.connectionHelpSummary}>{connectionHelp.summary}</p>
                <ul className={styles.connectionHelpList}>
                  {connectionHelp.hints.map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ul>
                {connectionHelp.rawBodyTitle ? (
                  <div className={styles.connectionHelpRaw}>
                    <strong className={styles.connectionHelpRawTitle}>
                      {connectionHelp.rawBodyTitle}
                    </strong>
                    <pre className={styles.connectionHelpRawBody}>
                      <code>{connectionHelp.rawBody}</code>
                    </pre>
                    {connectionHelp.rawBodyNote ? (
                      <p className={styles.connectionHelpRawNote}>
                        {connectionHelp.rawBodyNote}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className={styles.card}>
            {sectionHeading(ui.step(2), ui.auth)}
            <p className={styles.muted}>
              {ui.authIntro}
            </p>
            <div className={styles.fieldGrid}>
              <label className={styles.fieldWide}>
                <span>{ui.token}</span>
                <div className={styles.secretField}>
                  <input
                    type={showToken ? "text" : "password"}
                    value={auth.token}
                    onChange={(event) =>
                      setAuth((current) => ({ ...current, token: event.target.value }))
                    }
                    placeholder={ui.tokenPlaceholder}
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    aria-label={showToken ? ui.hideToken : ui.showToken}
                    onClick={() => setShowToken((current) => !current)}
                  >
                    <EyeButtonIcon open={showToken} />
                  </button>
                </div>
              </label>
            </div>
            <label className={styles.checkboxRow}>
              <input
                checked={autoAuthOnConnect}
                type="checkbox"
                onChange={(event) => setAutoAuthOnConnect(event.target.checked)}
              />
              <span>{ui.autoAuth}</span>
            </label>
            <div className={styles.actions}>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => sendAuthRequest()}
              >
                {ui.sendAuthRequest}
              </button>
            </div>
          </section>

          <section className={styles.card}>
            {sectionHeading(ui.step(3), ui.keepalive)}
            <div className={styles.keepaliveNote}>
              <strong className={styles.keepaliveTitle}>{ui.keepaliveTitle}</strong>
              <p className={styles.keepaliveText}>
                {ui.keepaliveIntro}
              </p>
            </div>
            <div className={styles.actions}>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => sendPingRequest()}
              >
                {ui.sendPingRequest}
              </button>
            </div>
            <label className={styles.checkboxRow}>
              <input
                checked={autoPingKeepalive}
                type="checkbox"
                onChange={(event) => setAutoPingKeepalive(event.target.checked)}
              />
              <span>{ui.autoPing}</span>
            </label>
          </section>

          <section className={styles.card}>
            <div className={styles.stepHeader}>
              {sectionHeading(ui.step(4), ui.sendMessages)}
            </div>
            <div className={styles.stepFlow}>
              <div>
                <p className={styles.groupTitle}>{ui.sendMessages}</p>
                <div className={styles.messageButtons}>
                  {sendMessages.map((messageKey) => (
                    <button
                      key={messageKey}
                      className={clsx(styles.messageButton, {
                        [styles.messageButtonActive]: selectedSendMessage === messageKey,
                      })}
                      type="button"
                      onClick={() => loadSendMessageDraft(messageKey)}
                    >
                      <strong>{messageKey}</strong>
                      <span>{spec.messages[messageKey].title}</span>
                    </button>
                  ))}
                </div>
              </div>
              <section className={styles.referenceCard}>
                <div className={styles.sectionHeader}>
                  <h3>{ui.parameters}</h3>
                  <span className={styles.referenceTitle}>{selectedSendMessage}</span>
                </div>
                <p className={styles.muted}>
                  {spec.messages[selectedSendMessage].title}
                </p>
                {spec.messages[selectedSendMessage].summary ? (
                  <p className={styles.messageSummary}>
                    {spec.messages[selectedSendMessage].summary}
                  </p>
                ) : null}
                {spec.messages[selectedSendMessage].description ? (
                  <p className={styles.messageSummary}>
                    {spec.messages[selectedSendMessage].description}
                  </p>
                ) : null}
                <SchemaReference
                  schema={spec.messages[selectedSendMessage].payloadSchema}
                  schemaType="request"
                />
              </section>
              {spec.messages[selectedSendMessage].examples.length ? (
                <>
                  <p className={styles.groupTitle}>{ui.examples}</p>
                  <ExamplePicker
                    examples={spec.messages[selectedSendMessage].examples}
                    selectedName={selectedSendExampleName}
                    expandLabel={ui.expandExamples}
                    collapseLabel={ui.collapseExamples}
                    onSelect={(name) => loadSendMessageDraft(selectedSendMessage, name)}
                  />
                </>
              ) : null}
              <textarea
                ref={sendEditorRef}
                className={styles.editor}
                value={sendDraft}
                onChange={(event) => setSendDraft(event.target.value)}
                spellCheck={false}
              />
              <div className={styles.editorActions}>
                <button
                  className="button button--primary"
                  type="button"
                  onClick={sendDraftMessage}
                >
                  {ui.sendCurrentMessage}
                </button>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            {sectionHeading(ui.step(5), ui.receiveMessages)}
            <div className={styles.stepFlow}>
              <div>
                <p className={styles.groupTitle}>{ui.serverReturnPush}</p>
                <div className={styles.messageButtons}>
                  {receiveMessages.map((messageKey) => (
                    <button
                      key={messageKey}
                      className={clsx(styles.messageButton, {
                        [styles.messageButtonActive]: selectedReceiveMessage === messageKey,
                      })}
                      type="button"
                      onClick={() => loadReceiveMessagePreview(messageKey)}
                    >
                      <strong>{messageKey}</strong>
                      <span>{spec.messages[messageKey].title}</span>
                    </button>
                  ))}
                </div>
              </div>
              <section className={styles.referenceCard}>
                <div className={styles.sectionHeader}>
                  <h3>{ui.parameters}</h3>
                  <span className={styles.referenceTitle}>{selectedReceiveMessage}</span>
                </div>
                <p className={styles.muted}>
                  {spec.messages[selectedReceiveMessage].title}
                </p>
                {spec.messages[selectedReceiveMessage].summary ? (
                  <p className={styles.messageSummary}>
                    {spec.messages[selectedReceiveMessage].summary}
                  </p>
                ) : null}
                {spec.messages[selectedReceiveMessage].description ? (
                  <p className={styles.messageSummary}>
                    {spec.messages[selectedReceiveMessage].description}
                  </p>
                ) : null}
                <SchemaReference
                  schema={spec.messages[selectedReceiveMessage].payloadSchema}
                  schemaType="response"
                />
              </section>
              {spec.messages[selectedReceiveMessage].examples.length ? (
                <>
                  <p className={styles.groupTitle}>{ui.examples}</p>
                  <ExamplePicker
                    examples={spec.messages[selectedReceiveMessage].examples}
                    selectedName={selectedReceiveExampleName}
                    expandLabel={ui.expandExamples}
                    collapseLabel={ui.collapseExamples}
                    onSelect={(name) => loadReceiveMessagePreview(selectedReceiveMessage, name)}
                  />
                </>
              ) : null}
              <pre className={styles.receivePreview}>
                <code>{receivePreview}</code>
              </pre>
            </div>
          </section>
        </div>

        <aside className={styles.logsRail}>
          <section className={clsx(styles.card, styles.logsCard)}>
            <div className={styles.sectionHeader}>
              <h3>{ui.realtimeLogs}</h3>
              <span className={styles.muted}>{logs.length} {ui.entries}</span>
            </div>
            <div className={styles.logs}>
              {logs.length ? (
                logs.map((entry) => (
                  <article
                    key={entry.id}
                    className={clsx(styles.logEntry, styles[`log${entry.level}`])}
                  >
                    <div className={styles.logHeader}>
                      <strong>{entry.title}</strong>
                      <span>{entry.timestamp}</span>
                    </div>
                    <pre className={styles.logContent}>
                      <code>{entry.content}</code>
                    </pre>
                  </article>
                ))
              ) : (
                <div className={styles.emptyState}>
                  {ui.emptyLogs}
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>

    </div>
  );
}

export default function AsyncApiWebSocketPlayground({ className }: ClientProps) {
  return (
    <BrowserOnly fallback={<div className={styles.browserFallback}>Loading WebSocket playground…</div>}>
      {() => <PlaygroundClient className={className} />}
    </BrowserOnly>
  );
}
