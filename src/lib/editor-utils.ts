export const EDITOR_SELECTOR = '[data-role="editor"]';

export function findEditor(): HTMLElement | null {
    return document.querySelector(EDITOR_SELECTOR);
}

export function getSelectedText(): string {
    const sel = window.getSelection();
    return sel ? sel.toString() : '';
}

export function isSelectionInsideEditor(editorEl: HTMLElement | null): boolean {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorEl) return false;
    const range = sel.getRangeAt(0);
    return editorEl.contains(range.commonAncestorContainer);
}

export function replaceSelectionWithText(editorEl: HTMLElement, newText: string): boolean {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const range = sel.getRangeAt(0);
    if (!editorEl.contains(range.commonAncestorContainer)) return false;

    range.deleteContents();
    const node = document.createTextNode(newText);
    range.insertNode(node);

    range.setStartAfter(node);
    range.setEndAfter(node);
    sel.removeAllRanges();
    sel.addRange(range);

    editorEl.focus();
    return true;
}

export function collectArgsFromIsland(root: HTMLElement): Record<string, any> {
    const out: Record<string, any> = {};
    const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-arg]'));
    for (const node of nodes) {
        const key = node.getAttribute('data-arg');
        if (!key) continue;
        const input = node as HTMLInputElement;
        if (typeof input.value !== 'undefined') out[key] = input.value;
        else if (node.dataset && typeof node.dataset.value !== 'undefined') out[key] = node.dataset.value;
        else out[key] = node.textContent ?? '';
    }
    return out;
}
