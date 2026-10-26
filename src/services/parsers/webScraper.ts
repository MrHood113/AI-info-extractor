import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import * as cheerio from 'cheerio';

export interface WebArticleContent {
  title: string;
  byline?: string;
  siteName?: string;
  excerpt?: string;
  textContent: string;
  url: string;
  length: number;
}

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 AI-Info-Extractor/1.0';

/**
 * Validates whether a string is an HTTP/HTTPS URL
 */
export function isValidHttpUrl(stringUrl: string): boolean {
  try {
    const url = new URL(stringUrl);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Fetches and parses a web article, isolating the core article content and stripping away
 * navbars, sidebars, advertisements, and footer garbage via Mozilla Readability.
 */
export async function cleanWebContent(targetUrl: string): Promise<WebArticleContent> {
  if (!isValidHttpUrl(targetUrl)) {
    throw new Error('Invalid web URL. Please provide a valid HTTP or HTTPS address.');
  }

  const response = await axios.get(targetUrl, {
    headers: {
      'User-Agent': BROWSER_USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
    },
    timeout: 15000,
    maxRedirects: 5,
    responseType: 'text',
  });

  const html = response.data;
  if (!html || typeof html !== 'string') {
    throw new Error('Target URL returned empty response content.');
  }

  // Pre-clean with cheerio to remove script/style tags that might confuse parsers
  const $ = cheerio.load(html);
  $('script, style, noscript, iframe, svg').remove();
  const cleanedHtml = $.html();

  // Parse through Mozilla Readability using JSDOM
  const dom = new JSDOM(cleanedHtml, { url: targetUrl });
  const reader = new Readability(dom.window.document, {
    charThreshold: 80,
  });

  const article = reader.parse();

  if (article && article.textContent && article.textContent.trim().length > 100) {
    const textContent = article.textContent
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();

    return {
      title: article.title || $('title').text().trim() || 'Untitled Article',
      byline: article.byline || undefined,
      siteName: article.siteName || new URL(targetUrl).hostname,
      excerpt: article.excerpt || undefined,
      textContent,
      url: targetUrl,
      length: textContent.length,
    };
  }

  // Fallback: If Readability deemed page non-article, extract main or body text
  const mainText = $('main, article, #content, .content, .post-body, body')
    .first()
    .text()
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  if (!mainText || mainText.length < 50) {
    throw new Error('Unable to extract meaningful textual content from the specified URL.');
  }

  return {
    title: $('title').text().trim() || new URL(targetUrl).hostname,
    siteName: new URL(targetUrl).hostname,
    textContent: mainText,
    url: targetUrl,
    length: mainText.length,
  };
}
