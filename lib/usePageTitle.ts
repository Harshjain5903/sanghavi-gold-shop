import { useEffect } from 'react';

const SITE = 'Sanghavi Gold';

/** Sets the browser tab / search result title for the current page. */
export const usePageTitle = (title?: string): void => {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : `${SITE} | Gold, Silver & Diamond Jewellery in Kalyan`;
  }, [title]);
};
