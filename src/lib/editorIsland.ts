type TransformId = 'caesar.shift';

const DEFAULT_SHIFT = 5 as const;

function caesarShift(text: string, shift: number = DEFAULT_SHIFT): string {
    const n = Number.isFinite(shift) ? shift : DEFAULT_SHIFT;

    return Array.from(text)
        .map((ch) => {
            const cp = ch.codePointAt(0);
            if (cp === undefined) return ch;

            // A-Z
            if (cp >= 65 && cp <= 90) {
                return String.fromCodePoint((((cp - 65 + n) % 26 + 26) % 26) + 65);
            }
            // a-z
            if (cp >= 97 && cp <= 122) {
                return String.fromCodePoint((((cp - 97 + n) % 26 + 26) % 26) + 97);
            }
            return ch;
        })
        .join('');
}

function applyTransformById(
    id: TransformId,
    text: string,
    args: { shift?: number } = {},
): string {
    switch (id) {
        case 'caesar.shift':
            return caesarShift(text, args.shift ?? DEFAULT_SHIFT);
        default:
            return text;
    }
}


function replaceSelectionWithText(editorEl: HTMLElement, newText: string): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;

  const range = sel.getRangeAt(0);
  if (!editorEl.contains(range.commonAncestorContainer)) return false;

  range.deleteContents();
  const textNode = document.createTextNode(newText);
  range.insertNode(textNode);

  range.setStartAfter(textNode);
  range.setEndAfter(textNode);
  sel.removeAllRanges();
  sel.addRange(range);

  editorEl.focus();
  return true;
}

function parseShift(root: HTMLElement): number {
  const raw = root.dataset.shift;
  if (raw === undefined) return DEFAULT_SHIFT;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : DEFAULT_SHIFT;
}

function initEditorIsland(root: HTMLElement): void {
  if (root.dataset.initialized === 'true') return;
  root.dataset.initialized = 'true';

  const btn = root.querySelector<HTMLButtonElement>('[data-role="caesar-btn"]');
  const editor = root.querySelector<HTMLElement>('[data-role="editor"]');
  const shift = parseShift(root);

  if (!btn || !editor) return;

  btn.addEventListener('click', (ev) => {
    ev.preventDefault();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;

    const selectedText = sel.toString();
    if (!selectedText) return;

    const transformed = applyTransformById('caesar.shift', selectedText, { shift });
    replaceSelectionWithText(editor, transformed);
  });
}

function initAll(): void {
  const nodes = document.querySelectorAll<HTMLElement>('[data-editor-island]');
  nodes.forEach(initEditorIsland);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll, { once: true });
} else {
  initAll();
}
