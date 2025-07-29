import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useThemeConfig, ErrorCauseBoundary } from '@docusaurus/theme-common';
import {
  splitNavbarItems,
  useNavbarMobileSidebar,
} from '@docusaurus/theme-common/internal';
import NavbarItem, { type Props as NavbarItemConfig } from '@theme/NavbarItem';
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle';
import SearchBar from '@theme/SearchBar';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import NavbarLogo from '@theme/Navbar/Logo';
import NavbarSearch from '@theme/Navbar/Search';

import styles from './styles.module.css';

// Grab config navbar items
function useNavbarItems(): NavbarItemConfig[] {
  return useThemeConfig().navbar.items as NavbarItemConfig[];
}

// Render all navbar items with error boundary
function NavbarItems({ items }: { items: NavbarItemConfig[] }): ReactNode {
  return items.map((item, idx) => (
    <ErrorCauseBoundary
      key={idx}
      onError={(err) =>
        new Error(
          `Navbar item render failed:\n${JSON.stringify(item, null, 2)}`,
          { cause: err }
        )
      }
    >
      <NavbarItem {...item} />
    </ErrorCauseBoundary>
  ));
}

// Layout
function NavbarContentLayout({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="navbar__inner">
      <div className="navbar__items">{left}</div>
      <div className="navbar__items navbar__items--right">{right}</div>
    </div>
  );
}

//  SSR-safe version
export default function NavbarContent(): ReactNode {
  const [isMounted, setIsMounted] = useState(false);
  const items = useNavbarItems();
  const [leftItems, rightItems] = splitNavbarItems(items);
  const searchBarItem = items.find((item) => item.type === 'search');

  // Mount guard to avoid SSR hook call
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <NavbarContentLayout
      left={
        <>
          {isMounted && !useNavbarMobileSidebar().disabled && (
            <NavbarMobileSidebarToggle />
          )}
          <NavbarLogo />
          <NavbarItems items={leftItems} />
        </>
      }
      right={
        <>
          <NavbarItems items={rightItems} />
          <NavbarColorModeToggle className={styles.colorModeToggle} />
          {!searchBarItem && (
            <NavbarSearch>
              <SearchBar />
            </NavbarSearch>
          )}
        </>
      }
    />
  );
}
