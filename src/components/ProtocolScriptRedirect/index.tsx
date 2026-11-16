import React, {type ReactNode, useEffect} from 'react';
import Link from '@docusaurus/Link';
import {resolveScriptAnchor, type ScriptTransport} from './anchors';

export default function ProtocolScriptRedirect({transport, href, children}: {
  transport: ScriptTransport;
  href: string;
  children: ReactNode;
}): ReactNode {
  useEffect(() => {
    // 仅保留已知旧锚点，替换历史记录，避免返回时再次进入旧页。
    window.location.replace(`${href}#${resolveScriptAnchor(transport, window.location.hash)}`);
  }, [transport, href]);

  return <div><Link to={`${href}#${transport}`}>{children}</Link></div>;
}
