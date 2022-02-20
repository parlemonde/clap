import React from "react";

import { useTranslation } from "src/i18n/useTranslation";

export interface TransProps {
  i18nKey: string;
  i18nParams?: { [key: string]: string | number };
  children: React.ReactNode[];
}

function getTranslatedChild(child: React.ReactNode, childIndex: number, str: string | null): React.ReactNode {
  if (typeof child === "string") {
    return str;
  }
  if (React.isValidElement(child)) {
    const childChildren = child.props.children;
    return React.cloneElement(child, { ...child.props, key: childIndex }, getTranslatedChild(childChildren, childIndex, str));
  }
  return null;
}

export const Trans: React.FunctionComponent<TransProps> = ({ i18nKey, i18nParams = {}, children }: TransProps) => {
  const { t } = useTranslation();
  const translatedStr = t(i18nKey, i18nParams)
    .replace(/<\d>/gm, "<div>")
    .replace(/<\/\d>/gm, "</div>");
  const translatedStrings = React.useMemo(() => {
    const el = document.createElement("div");
    el.innerHTML = translatedStr;
    return [...el.childNodes].map((node) => node.textContent);
  }, [translatedStr]);

  const newChildren = children
    .slice(0, translatedStrings.length)
    .map((child, childIndex) => getTranslatedChild(child, childIndex, translatedStrings[childIndex]));
  return <>{newChildren}</>;
};
