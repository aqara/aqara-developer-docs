import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Tabs from "@theme/Tabs";
import type {Props as TabsProps} from "@theme/Tabs";
import React, {useLayoutEffect, useRef, useState} from "react";

import styles from "./styles.module.css";

type ExampleTabsProps = {
  children: TabsProps["children"];
};

function labelsOverflow(list: HTMLElement) {
  const items = Array.from(list.querySelectorAll<HTMLElement>(".tabs__item"));
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

export default function ExampleTabs({children}: ExampleTabsProps) {
  const {i18n} = useDocusaurusContext();
  const isChinese = i18n.currentLocale === "zh";
  const expandLabel = isChinese ? "展开" : "Show all";
  const collapseLabel = isChinese ? "收起" : "Collapse";
  const rootRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const list = root?.querySelector<HTMLElement>(".tabs");
    if (!root || !list) {
      return undefined;
    }

    const measure = () => {
      setOverflowing(labelsOverflow(list));
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(list);
    return () => observer.disconnect();
  }, [children]);

  useLayoutEffect(() => {
    if (!overflowing) {
      setExpanded(false);
    }
  }, [overflowing]);

  const showToggle = overflowing || expanded;

  return (
    <div ref={rootRef} className={`${styles.wrap}${expanded ? ` ${styles.expanded}` : ""}`}>
      <Tabs>{children}</Tabs>
      {showToggle ? (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? collapseLabel : expandLabel}
        </button>
      ) : null}
    </div>
  );
}
