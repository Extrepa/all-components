import * as cheerio from 'cheerio';
import { COMPONENT_HEURISTICS, ComponentType } from './heuristics';

export interface ExtractedComponent {
  type: ComponentType;
  html: string;
  text: string;
  attributes: Record<string, string>;
  score: number;
  selector: string;
}

export class PageAnalyzer {
  private $: cheerio.CheerioAPI;
  private baseUrl: string;

  constructor(html: string, baseUrl: string) {
    this.$ = cheerio.load(html);
    this.baseUrl = baseUrl;
  }

  public extractAll(): ExtractedComponent[] {
    const results: ExtractedComponent[] = [];
    for (const [type, rules] of Object.entries(COMPONENT_HEURISTICS)) {
      const candidates = this.findCandidates(type as ComponentType, rules);
      results.push(...candidates);
    }
    return results;
  }

  private findCandidates(type: ComponentType, rules: any): ExtractedComponent[] {
    const candidates: ExtractedComponent[] = [];
    const selectorParts = [...rules.tags, ...(rules.roles || []).map((r: string) => `[role="${r}"]`), ...(rules.keywords || []).map((k: string) => `[class*="${k}"]`)];
    
    this.$(selectorParts.join(', ')).each((i, el) => {
      const $el = this.$(el);
      const score = this.calculateScore($el, rules);
      if (score > 10) {
        const $clone = $el.clone();
        this.cleanHtml($clone);
        this.normalizeUrls($clone);
        candidates.push({
          type,
          html: $clone.prop('outerHTML') || '',
          text: $el.text().slice(0, 100).trim(),
          attributes: $el.attr() || {},
          score,
          selector: `${($el.prop('tagName') || 'div').toLowerCase()}${i}`
        });
      }
    });
    return candidates;
  }

  private calculateScore($el: cheerio.Cheerio<any>, rules: any): number {
    let score = 0;
    const classIdStr = `${$el.attr('class') || ''} ${$el.attr('id') || ''}`.toLowerCase();
    const tagName = $el.prop('tagName');
    if (tagName && rules.tags.includes(tagName.toLowerCase())) score += 10;
    rules.keywords.forEach((k: string) => { if (classIdStr.includes(k)) score += 5; });
    return score;
  }

  private cleanHtml($el: cheerio.Cheerio<any>) { $el.find('script, style, iframe, noscript').remove(); }
  
  private normalizeUrls($el: cheerio.Cheerio<any>) {
    $el.find('[src]').each((_, el) => {
      const src = this.$(el).attr('src');
      if (src && !src.startsWith('http') && !src.startsWith('data:')) this.$(el).attr('src', new URL(src, this.baseUrl).toString());
    });
    $el.find('[href]').each((_, el) => {
      const href = this.$(el).attr('href');
      if (href && !href.startsWith('http') && !href.startsWith('#')) this.$(el).attr('href', new URL(href, this.baseUrl).toString());
    });
  }
}
