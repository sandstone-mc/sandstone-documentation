import React, { useState, cloneElement, Children, ReactElement, useEffect, useLayoutEffect } from 'react';

import clsx from 'clsx';

import styles from '@docusaurus/theme-classic/lib/theme/Tabs/styles.module.css';
import useTabGroupChoice from '../hooks/useTabGroupChoice';

function isInViewport(element: HTMLElement): boolean {
  const { top, left, bottom, right } = element.getBoundingClientRect();
  const { innerHeight, innerWidth } = window;

  return top >= 0 && right <= innerWidth && bottom <= innerHeight && left >= 0;
}

const keys = {
  left: 37,
  right: 39,
} as const;

export function Tabs(props: { lazy?: boolean, block?: unknown, defaultValue?: string, values?: any, groupId?: string, className?: string, children: any }): React.JSX.Element {
  const { lazy, block, defaultValue, values, groupId, className } = props;
  const { tabGroupChoices, setTabGroupChoices } = useTabGroupChoice();
  const children = Children.toArray(
    props.children,
  ) as ReactElement<any>[];

  const [selectedValue, setSelectedValue] = useState(defaultValue);

  const defaultValueIndex: number = children.map((c, i) => [c.props.value, i]).find(([v, i]) => v === defaultValue)[1]
  const [selectedIndex, setSelectedIndex] = useState(defaultValueIndex);

  const tabRefs: (HTMLLIElement | null)[] = [];

  if (groupId != null) {
    const relevantTabGroupChoice = tabGroupChoices[groupId];
    if (
      relevantTabGroupChoice != null &&
      relevantTabGroupChoice !== selectedValue &&
      values.some((value) => value.value === relevantTabGroupChoice)
    ) {
      const index = values.map(({ value }, i) => ({ value, i })).find(({ value }) => value === relevantTabGroupChoice).i
      setSelectedValue(relevantTabGroupChoice);
      setSelectedIndex(index)
    }
  }

  const handleTabChange = (
    event: React.FocusEvent<HTMLLIElement> | React.MouseEvent<HTMLLIElement>,
  ) => {
    const selectedTab = event.currentTarget;
    const selectedTabIndex = tabRefs.indexOf(selectedTab);
    const selectedTabValue = values[selectedTabIndex].value;

    setSelectedValue(selectedTabValue);
    setSelectedIndex(selectedTabIndex)

    if (groupId != null) {
      setTabGroupChoices(groupId, selectedTabValue);

      setTimeout(() => {
        if (isInViewport(selectedTab)) {
          return;
        }

        selectedTab.scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        });

        selectedTab.classList.add(styles.tabItemActive);
        setTimeout(
          () => selectedTab.classList.remove(styles.tabItemActive),
          2000,
        );
      }, 150);
    }
  };

  const handleKeydown = (event) => {
    let focusElement;

    switch (event.keyCode) {
      case keys.right: {
        const nextTab = tabRefs.indexOf(event.target) + 1;
        focusElement = tabRefs[nextTab] || tabRefs[0];
        break;
      }
      case keys.left: {
        const prevTab = tabRefs.indexOf(event.target) - 1;
        focusElement = tabRefs[prevTab] || tabRefs[tabRefs.length - 1];
        break;
      }
      default:
        break;
    }

    focusElement?.focus();
  };

  function getIndexToDisplay(): number {
    // If the tab externally changed, maybe the order changed. Update the index to reflect this change.
    if (selectedIndex < values.length && values[selectedIndex].value !== selectedValue) {
      const index = values.findIndex(({ value }) => value === selectedValue)
      if (index > -1) {
        // We found a tab with the same name, but at a different index. Display it.
        return index
      }
    }

    // If the tab selected doesn't exist anymore, go to the tab with the nearest index
    if (!values.some(({ value }) => value === selectedValue)) {
      // No tab with identical name exists

      if (values.length > selectedIndex) {
        // Another tab with same index exists => tab might has been renamed, or delete & another one took its place
        setSelectedValue(values[selectedIndex].value)
        return selectedIndex
      }

      // The selected tab has been removed, and we're out of bounds now. Go to the last tab.
      const index = values.length - 1
      setSelectedValue(values[index].value)

      return index
    }

    return selectedIndex
  }

  const indexToDisplay = getIndexToDisplay()

  if (indexToDisplay !== selectedIndex) {
    setSelectedIndex(indexToDisplay)
  }

  return (
    <div className="tabs-container">
      <ul
        role="tablist"
        aria-orientation="horizontal"
        className={clsx(
          'tabs',
          {
            'tabs--block': block,
          },
          className,
        )}>
        {values.map(({ value, label }, i) => (
          <li
            role="tab"
            tabIndex={i === indexToDisplay ? 0 : -1}
            aria-selected={i === indexToDisplay}
            className={clsx('tabs__item', styles.tabItem, {
              'tabs__item--active': i === indexToDisplay,
            })}
            key={value}
            ref={(tabControl) => { tabRefs.push(tabControl) }}
            onKeyDown={handleKeydown}
            onFocus={handleTabChange}
            onClick={handleTabChange}>
            {label}
          </li>
        ))}
      </ul>

      {lazy ? (
        cloneElement(
          children.filter(
            (tabItem, i) => i === indexToDisplay,
          )[0],
          { className: 'margin-vert--md' },
        )
      ) : (
        <div className="margin-vert--md">
          {children.map((tabItem, i) =>
            cloneElement(tabItem, {
              key: tabItem.props.value,
              hidden: i !== indexToDisplay,
            }),
          )}
        </div>
      )}
    </div>
  );
}