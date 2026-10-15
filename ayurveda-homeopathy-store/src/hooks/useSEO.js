/**
 * useSEO — lightweight per-route document head manager
 * ─────────────────────────────────────────────────────
 * Updates the page <title>, meta description, canonical URL,
 * Open Graph + Twitter tags and robots directives for the
 * currently active route in this client-rendered SPA.
 *
 * Dependency-free by design so it stays aligned with the
 * existing stack (React + Vite). Values are recomputed on
 * every route change; unchanged values leave the DOM alone.
 */
import { useEffect } from "react";

const SITE_NAME = "Malik's Polyclinic";

/** Fallback used for the home page and any route without a description. */
export const DEFAULT_DESCRIPTION =
  "Book consultations with qualified Ayurvedic & Homeopathic doctors and shop natural wellness products at Malik's Polyclinic, Chikodi.";

/** Fallback <title> for the home page (no redundant site suffix). */
const DEFAULT_TITLE = `${SITE_NAME} | Ayurvedic & Homeopathy Clinic & Store`;

/** SEO-friendly cap for a meta description (≈ 155 characters). */
const DESCRIPTION_LIMIT = 155;

/** Truncate on a word boundary and append an ellipsis when needed. */
const truncate = (text, limit = DESCRIPTION_LIMIT) => {
  if (typeof text !== "string") return "";
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= limit) return clean;
  const sliced = clean.slice(0, limit - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > 40 ? sliced.slice(0, lastSpace) : sliced).trimEnd()}…`;
};

/** Create or update a single <meta> tag identified by name/property. */
function upsertMeta(attribute, key, content) {
  if (content == null || content === "") return;
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

/** Create or update a single <link rel="..."> tag. */
function upsertLink(rel, href) {
  if (href == null || href === "") return;
  const selector = `link[rel="${rel}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export function useSEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  noindex = false,
  ogType = "website",
} = {}) {
  // Depend on primitives (not the object) so the effect only re-runs
  // when a meaningful value actually changes.
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const cleanDescription = truncate(description);
    // Always use the live origin so canonical/OG URLs are correct on
    // any deployment domain (production, preview, or localhost).
    const origin = window.location.origin;
    const url = `${origin}${path}`;

    document.title = fullTitle;

    upsertMeta("name", "description", cleanDescription);
    upsertMeta(
      "name",
      "robots",
      noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large",
    );

    upsertLink("canonical", url);

    // Open Graph
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", cleanDescription);
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:url", url);

    // Twitter
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", cleanDescription);
  }, [title, description, path, noindex, ogType]);
}

export default useSEO;
