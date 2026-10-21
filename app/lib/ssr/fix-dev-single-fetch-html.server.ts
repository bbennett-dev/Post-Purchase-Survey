/**
 * React Router single-fetch appends turbo-stream `enqueue` / `close` scripts
 * after `</html>`, while `entry.client` loads from an async `type="module"` tag
 * in `<body>`. The module can execute before those trailing scripts run, which
 * breaks hydration timing in Vite dev. Move bootstrap inline scripts before the
 * entry module and drop `async` so they run in document order.
 */
export function fixDevSingleFetchHtmlOrder(html: string): string {
  const htmlClose = "</html>";
  const htmlCloseIndex = html.indexOf(htmlClose);
  if (htmlCloseIndex === -1) {
    return html;
  }

  const afterHtml = html.slice(htmlCloseIndex + htmlClose.length);
  if (!afterHtml.includes("streamController.close()")) {
    return html;
  }

  const bootstrapTail = afterHtml.trim();
  let documentHtml = html.slice(0, htmlCloseIndex + htmlClose.length);

  const entryModulePattern =
    /<script type="module"[^>]*>[\s\S]*?import\("\/app\/entry\.client\.tsx"\);[\s\S]*?<\/script>/;
  const moduleMatch = documentHtml.match(entryModulePattern);
  if (!moduleMatch || moduleMatch.index == null) {
    return documentHtml.replace(
      "</body>",
      `${bootstrapTail}\n</body>`,
    );
  }

  const moduleScript = moduleMatch[0]
    .replace(/\sasync(?:="")?/g, "")
    .replace(/\sasync\b/g, "");

  const beforeModule = documentHtml.slice(0, moduleMatch.index);
  const afterModule = documentHtml.slice(
    moduleMatch.index + moduleMatch[0].length,
  );

  return `${beforeModule}${bootstrapTail}\n${moduleScript}${afterModule}`;
}
