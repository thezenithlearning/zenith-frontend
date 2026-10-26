/**
 * Authored pages are often pasted as full documents. Inside server-rendered
 * HTML the browser's parser merges a stray <body ...> tag's attributes (its
 * style, class) onto the real <body>, which then fails hydration. Document
 * wrapper tags are removed so only the page's contents render; a <body>
 * becomes a <div> so its own style/class still apply to its contents.
 */
export function fragmentHtml(html: string): string {
  return html
    .replace(/<!doctype[^>]*>/gi, '')
    .replace(/<\/?html\b[^>]*>/gi, '')
    .replace(/<\/?head\b[^>]*>/gi, '')
    .replace(/<body\b([^>]*)>/gi, '<div$1>')
    .replace(/<\/body\s*>/gi, '</div>');
}
