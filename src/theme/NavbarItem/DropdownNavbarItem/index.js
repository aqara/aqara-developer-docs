import React from 'react';
import {useLocation} from '@docusaurus/router';
import DropdownNavbarItem from '@theme-original/NavbarItem/DropdownNavbarItem';

function normalizePath(path) {
  return path.toLowerCase().replace(/\/$/, '');
}

function getSelectedLabel(items, pathname, defaultLabel) {
  const normalizedPathname = normalizePath(pathname);
  const selectedItem = items.find((item) => {
    const targetPath = item.activeBasePath ?? item.to ?? item.href;

    return targetPath && normalizedPathname.includes(normalizePath(targetPath));
  });

  return selectedItem?.label ?? defaultLabel;
}

export default function DropdownNavbarItemWrapper({label, items, ...props}) {
  const {pathname} = useLocation();
  const selectedLabel = getSelectedLabel(items, pathname, label);

  return <DropdownNavbarItem {...props} label={selectedLabel} items={items} />;
}
