/**
 * Dynamically load the pipeline's dist CSS into Storybook so that all
 * --cdr-* custom properties are available at runtime.
 *
 * Light-mode properties are injected at :root (default).
 * Dark-mode properties are re-scoped to [data-mode="dark"] so the
 * Storybook platform/mode toolbar controls which set is active.
 *
 * This runs once at preview init time. Because the CSS is loaded from
 * staticDirs (/dist-css/), it always reflects the latest pipeline build
 * with zero manual maintenance.
 */

let loaded = false;

export async function loadDistCss(): Promise<void> {
  if (loaded) return;
  loaded = true;

  // Light mode — inject as-is (already :root scoped)
  await injectStylesheet("/dist-css/cdr-light.css", "cdr-dist-light");

  // Dark mode — rewrite :root selectors to [data-mode="dark"]
  await injectRescopedStylesheet(
    "/dist-css/cdr-dark.css",
    ":root",
    '[data-mode="dark"]',
    "cdr-dist-dark",
  );
}

async function injectStylesheet(href: string, id: string): Promise<void> {
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Fetch a CSS file, replace all occurrences of `fromSelector` with
 * `toSelector`, and inject it as an inline <style> element.
 * This handles the sub-file @imports by fetching each imported file
 * and concatenating them.
 */
async function injectRescopedStylesheet(
  href: string,
  fromSelector: string,
  toSelector: string,
  id: string,
): Promise<void> {
  if (document.getElementById(id)) return;

  const baseUrl = href.replace(/[^/]*$/, "");
  const css = await fetchAndResolveImports(href, baseUrl);
  const rescoped = css.replace(
    new RegExp(escapeRegex(fromSelector), "g"),
    toSelector,
  );

  const style = document.createElement("style");
  style.id = id;
  style.textContent = rescoped;
  document.head.appendChild(style);
}

async function fetchAndResolveImports(
  href: string,
  baseUrl: string,
): Promise<string> {
  const res = await fetch(href);
  if (!res.ok) {
    console.warn(`[load-dist-css] Failed to fetch ${href}: ${res.status}`);
    return "";
  }
  let css = await res.text();

  // Resolve @import './dark/foo.css' inline
  const importRegex = /@import\s+['"]([^'"]+)['"]\s*;/g;
  const imports: { match: string; url: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = importRegex.exec(css)) !== null) {
    imports.push({ match: m[0], url: m[1] });
  }

  for (const imp of imports) {
    const resolvedUrl = new URL(imp.url, window.location.origin + baseUrl).pathname;
    const subRes = await fetch(resolvedUrl);
    const subCss = subRes.ok ? await subRes.text() : "";
    css = css.replace(imp.match, subCss);
  }

  return css;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
