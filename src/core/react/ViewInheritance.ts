export type XPathAttrFilter = (element: Element) => boolean;

export interface ViewInheritanceRule {
  targetModel?: string;
  targetView?: string;
  selector: string;
  position: 'inside' | 'outside' | 'replace' | 'before' | 'after';
  inherit?: string;
}

export interface ArchModifier {
  add?: string;
  remove?: string;
  replace?: string;
  before?: string;
  after?: string;
  attribute?: Record<string, string | number | boolean>;
}

export class ViewInheritance {
  private rules: ViewInheritanceRule[] = [];

  registerRule(rule: ViewInheritanceRule): void {
    this.rules.push(rule);
  }

  getRulesForModel(model: string): ViewInheritanceRule[] {
    return this.rules.filter(r => !r.targetModel || r.targetModel === model);
  }

  getRulesForView(model: string, viewType: string): ViewInheritanceRule[] {
    return this.rules.filter(
      r => (!r.targetModel || r.targetModel === model) && (!r.targetView || r.targetView === viewType)
    );
  }

  applyInheritance(arch: string, parentArch?: string): string {
    let result = arch;

    for (const rule of this.rules) {
      result = this.applyRule(result, rule);
    }

    if (parentArch) {
      result = this.applyParentInheritance(result, parentArch);
    }

    return result;
  }

  private applyRule(arch: string, rule: ViewInheritanceRule): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<root>${arch}</root>`, 'text/xml');
    const root = doc.documentElement;

    const matches = this.findElements(root, rule.selector);

    switch (rule.position) {
      case 'inside':
        for (const el of matches) {
          const inherited = this.findInheritedElement(root, rule.inherit);
          if (inherited) {
            while (inherited.firstChild) {
              el.appendChild(inherited.firstChild);
            }
          }
        }
        break;
      case 'replace':
        for (const el of matches) {
          const inherited = this.findInheritedElement(root, rule.inherit);
          if (inherited) {
            el.replaceWith(...Array.from(inherited.childNodes));
          }
        }
        break;
      case 'before':
        for (const el of matches) {
          const inherited = this.findInheritedElement(root, rule.inherit);
          if (inherited) {
            el.parentNode?.insertBefore(inherited, el);
          }
        }
        break;
      case 'after':
        for (const el of matches) {
          const inherited = this.findInheritedElement(root, rule.inherit);
          if (inherited && el.nextSibling) {
            el.parentNode?.insertBefore(inherited, el.nextSibling);
          }
        }
        break;
    }

    return root.innerHTML;
  }

  private findElements(root: Element, selector: string): Element[] {
    try {
      const result = root.querySelectorAll(selector);
      return Array.from(result);
    } catch {
      return [];
    }
  }

  private findInheritedElement(root: Element, id?: string): Element | null {
    if (!id) return null;
    return root.querySelector(`[id='${id}']`) || null;
  }

  private applyParentInheritance(childArch: string, parentArch: string): string {
    const childDoc = new DOMParser().parseFromString(`<root>${childArch}</root>`, 'text/xml');
    const parentDoc = new DOMParser().parseFromString(`<root>${parentArch}</root>`, 'text/xml');

    this.mergeArch(childDoc.documentElement, parentDoc.documentElement);

    return childDoc.documentElement.innerHTML;
  }

  private mergeArch(child: Element, parent: Element): void {
    for (const childEl of Array.from(child.children)) {
      const inheritAttr = childEl.getAttribute('inherit');
      if (inheritAttr) {
        const parentMatch = parent.querySelector(`[id='${inheritAttr}']`);
        if (parentMatch) {
          for (const attr of Array.from(parentMatch.attributes)) {
            if (!childEl.hasAttribute(attr.name)) {
              childEl.setAttribute(attr.name, attr.value);
            }
          }
          childEl.removeAttribute('inherit');
        }
      }
    }
  }

  clear(): void {
    this.rules = [];
  }
}

export const viewInheritance = new ViewInheritance();

export function parseArch(arch: string): Element | null {
  try {
    const parser = new DOMParser();
    return parser.parseFromString(`<root>${arch}</root>`, 'text/xml').documentElement;
  } catch {
    return null;
  }
}

export function archToString(root: Element): string {
  return new XMLSerializer().serializeToString(root).replace(/^<root>/, '').replace(/<\/root>$/, '');
}