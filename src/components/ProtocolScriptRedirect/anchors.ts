export type ScriptTransport = 'tcp-udp' | 'http' | 'mqtt';

const ANCHORS: Record<ScriptTransport, Record<string, string>> = {
  'tcp-udp': {
    messages: 'tcp-udp-messages', discovery: 'tcp-udp-discovery',
    framing: 'tcp-udp-framing', example: 'tcp-udp-example', debugging: 'tcp-udp-debugging',
  },
  http: {
    messages: 'http-messages', 'discovery-and-report': 'http-discovery-and-report',
    example: 'http-example', debugging: 'http-debugging',
  },
  mqtt: {
    discovery: 'mqtt-discovery', messages: 'mqtt-messages', commands: 'mqtt-commands',
    example: 'mqtt-example', debugging: 'mqtt-debugging',
  },
};

export function resolveScriptAnchor(transport: ScriptTransport, hash: string): string {
  let key: string;
  try {
    key = decodeURIComponent(hash.replace(/^#/, ''));
  } catch {
    return transport;
  }
  const anchors = ANCHORS[transport];
  return Object.hasOwn(anchors, key) ? anchors[key] : transport;
}
