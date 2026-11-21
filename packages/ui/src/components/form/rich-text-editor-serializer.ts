/**
 * Serializer markdown murni untuk RichTextEditor (FR-015, D13).
 * Cakupan inti: H1–H3/paragraf/list/quote/code/link/bold/italic/gambar.
 * Di luar inti: fallback HTML mentah. HTML tetap sumber kebenaran.
 * Tanpa dependency baru (tanpa `tiptap-markdown` di v1).
 */

function escapeMarkdownText(value: string): string {
  return value.replace(/\\/g, '\\\\');
}

function inlineToMarkdown(el: Element): string {
  let out = '';
  el.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      out += escapeMarkdownText(node.textContent ?? '');
      return;
    }
    if (node.nodeType !== 1) return;
    const child = node as Element;
    const tag = child.tagName.toLowerCase();
    if (tag === 'strong' || tag === 'b') {
      out += `**${inlineToMarkdown(child)}**`;
    } else if (tag === 'em' || tag === 'i') {
      out += `*${inlineToMarkdown(child)}*`;
    } else if (tag === 'code') {
      out += `\`${(child.textContent ?? '').replace(/`/g, "'")}\``;
    } else if (tag === 'a') {
      const href = child.getAttribute('href') ?? '';
      out += `[${inlineToMarkdown(child)}](${href})`;
    } else if (tag === 'img') {
      const src = child.getAttribute('src') ?? '';
      const alt = child.getAttribute('alt') ?? '';
      out += `![${alt}](${src})`;
    } else if (tag === 'br') {
      out += '\n';
    } else if (tag === 'u' || tag === 's' || tag === 'strike' || tag === 'span') {
      out += inlineToMarkdown(child);
    } else {
      // Di luar inti: fallback HTML mentah.
      out += child.outerHTML;
    }
  });
  return out;
}

function blockToMarkdown(el: Element, listDepth = 0): string {
  const tag = el.tagName.toLowerCase();
  if (tag === 'h1') return `# ${inlineToMarkdown(el).trim()}`;
  if (tag === 'h2') return `## ${inlineToMarkdown(el).trim()}`;
  if (tag === 'h3') return `### ${inlineToMarkdown(el).trim()}`;
  if (tag === 'blockquote') {
    const inner = inlineToMarkdown(el).trim().replace(/\n/g, '\n> ');
    return `> ${inner}`;
  }
  if (tag === 'pre') {
    const text = el.textContent ?? '';
    return `\`\`\`\n${text.replace(/\n$/, '')}\n\`\`\``;
  }
  if (tag === 'hr') return '---';
  if (tag === 'ul' || tag === 'ol') {
    const items: string[] = [];
    let index = 1;
    el.childNodes.forEach((node) => {
      if (node.nodeType !== 1 || (node as Element).tagName.toLowerCase() !== 'li') return;
      const li = node as Element;
      // Nested list satu tingkat: render setelah teks item.
      let text = '';
      const nested: string[] = [];
      li.childNodes.forEach((child) => {
        if (child.nodeType === 1) {
          const childEl = child as Element;
          const childTag = childEl.tagName.toLowerCase();
          if (childTag === 'ul' || childTag === 'ol') {
            nested.push(blockToMarkdown(childEl, listDepth + 1));
            return;
          }
        }
        const span = el.ownerDocument.createElement('span');
        span.appendChild(child.cloneNode(true));
        text += inlineToMarkdown(span);
      });
      const indent = '  '.repeat(listDepth);
      const marker = tag === 'ol' ? `${index}. ` : '- ';
      items.push(`${indent}${marker}${text.trim()}`);
      for (const n of nested) items.push(n);
      index += 1;
    });
    return items.join('\n');
  }
  if (tag === 'p' || tag === 'div') {
    const text = inlineToMarkdown(el).trim();
    // Paragraf berisi satu gambar saja → blok gambar markdown.
    const onlyImg = el.querySelectorAll('*');
    if (onlyImg.length === 1 && onlyImg[0]?.tagName.toLowerCase() === 'img' && text === '') {
      const img = onlyImg[0] as HTMLImageElement;
      return `![${img.getAttribute('alt') ?? ''}](${img.getAttribute('src') ?? ''})`;
    }
    return text;
  }
  if (tag === 'img') {
    return `![${el.getAttribute('alt') ?? ''}](${el.getAttribute('src') ?? ''})`;
  }
  // Di luar inti (tabel/embed/dll): fallback HTML mentah.
  return el.outerHTML;
}

export function htmlToMarkdown(html: string): string {
  if (!html || !html.trim()) return '';
  if (typeof document === 'undefined') return '';
  const container = document.createElement('div');
  container.innerHTML = html;
  const blocks: string[] = [];
  container.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      const text = (node.textContent ?? '').trim();
      if (text) blocks.push(escapeMarkdownText(text));
      return;
    }
    if (node.nodeType !== 1) return;
    blocks.push(blockToMarkdown(node as Element));
  });
  return blocks.filter((b) => b !== '').join('\n\n');
}

function inlineFromMarkdown(source: string): string {
  let out = escapeHtml(source);
  // Gambar dulu agar tidak tertelan pola link.
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt: string, src: string) => {
    return `<img src="${unescapeAttr(src)}" alt="${unescapeAttr(alt)}" />`;
  });
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, href: string) => {
    return `<a href="${unescapeAttr(href)}">${text}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  out = out.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  return out;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function unescapeAttr(value: string): string {
  return value.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

export function markdownToHtml(markdown: string): string {
  if (!markdown || !markdown.trim()) return '';
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;
  let inCode = false;
  let codeBuf: string[] = [];

  const flushList = (items: Array<{ ordered: boolean; depth: number; html: string }>): string => {
    if (items.length === 0) return '';
    // Kelompokkan per kedalaman 0 saja (satu tingkat nesting didukung via indent 2 spasi).
    let html = '';
    let current: 'ul' | 'ol' | null = null;
    const openNested: boolean[] = [];
    for (const item of items) {
      const tag = item.ordered ? 'ol' : 'ul';
      if (current !== tag) {
        if (current) html += `</${current}>`;
        html += `<${tag}>`;
        current = tag;
      }
      if (item.depth > 0) {
        if (!openNested[item.depth]) {
          html += `<${tag}>`;
          openNested[item.depth] = true;
        }
        html += `<li>${item.html}</li>`;
      } else {
        while (openNested.some(Boolean)) {
          const d = openNested.lastIndexOf(true);
          openNested[d] = false;
          html += `</${tag}>`;
        }
        html += `<li>${item.html}</li>`;
      }
    }
    while (openNested.some(Boolean)) {
      const d = openNested.lastIndexOf(true);
      openNested[d] = false;
      html += current ? `</${current}>` : '';
    }
    if (current) html += `</${current}>`;
    return html;
  };

  let pendingList: Array<{ ordered: boolean; depth: number; html: string }> = [];
  const flushPendingList = (): void => {
    if (pendingList.length > 0) {
      out.push(flushList(pendingList));
      pendingList = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i] ?? '';

    if (line.trim() === '```') {
      if (!inCode) {
        inCode = true;
        codeBuf = [];
      } else {
        inCode = false;
        out.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
      }
      i += 1;
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      i += 1;
      continue;
    }

    const trimmed = line.trim();
    if (trimmed === '') {
      flushPendingList();
      i += 1;
      continue;
    }

    // Di luar inti: baris HTML mentah diteruskan apa adanya.
    if (/^<([a-z][\w-]*)\b[^>]*>.*<\/\1>\s*$/.test(trimmed) || /^<(hr|img|br)[^>]*\/?>\s*$/.test(trimmed)) {
      flushPendingList();
      out.push(trimmed);
      i += 1;
      continue;
    }

    const h3 = trimmed.match(/^###\s+(.+)$/);
    if (h3?.[1] !== undefined) {
      flushPendingList();
      out.push(`<h3>${inlineFromMarkdown(h3[1])}</h3>`);
      i += 1;
      continue;
    }
    const h2 = trimmed.match(/^##\s+(.+)$/);
    if (h2?.[1] !== undefined) {
      flushPendingList();
      out.push(`<h2>${inlineFromMarkdown(h2[1])}</h2>`);
      i += 1;
      continue;
    }
    const h1 = trimmed.match(/^#\s+(.+)$/);
    if (h1?.[1] !== undefined) {
      flushPendingList();
      out.push(`<h1>${inlineFromMarkdown(h1[1])}</h1>`);
      i += 1;
      continue;
    }
    if (trimmed === '---') {
      flushPendingList();
      out.push('<hr />');
      i += 1;
      continue;
    }
    const quote = trimmed.match(/^&gt;|^>/);
    if (quote) {
      flushPendingList();
      const content = trimmed.replace(/^>\s?/, '');
      out.push(`<blockquote><p>${inlineFromMarkdown(content)}</p></blockquote>`);
      i += 1;
      continue;
    }
    const imgOnly = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/);
    if (imgOnly?.[1] !== undefined && imgOnly[2] !== undefined) {
      flushPendingList();
      out.push(`<p><img src="${unescapeAttr(imgOnly[2])}" alt="${unescapeAttr(imgOnly[1])}" /></p>`);
      i += 1;
      continue;
    }
    const ul = line.match(/^(\s*)[-*]\s+(.+)$/);
    if (ul?.[2] !== undefined) {
      const depth = Math.min(1, Math.floor((ul[1] ?? '').replace(/\t/g, '  ').length / 2));
      pendingList.push({ ordered: false, depth, html: inlineFromMarkdown(ul[2]) });
      i += 1;
      continue;
    }
    const ol = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (ol?.[2] !== undefined) {
      const depth = Math.min(1, Math.floor((ol[1] ?? '').replace(/\t/g, '  ').length / 2));
      pendingList.push({ ordered: true, depth, html: inlineFromMarkdown(ol[2]) });
      i += 1;
      continue;
    }
    flushPendingList();
    out.push(`<p>${inlineFromMarkdown(trimmed)}</p>`);
    i += 1;
  }
  flushPendingList();
  if (inCode) {
    out.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
  }
  return out.join('');
}
