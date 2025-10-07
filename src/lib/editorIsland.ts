import { autoRegisterAll, applyModifierById } from '@/lib/modifiers/index';
import {
    findEditor,
    isSelectionInsideEditor,
    getSelectedText,
    replaceSelectionWithText,
    collectArgsFromIsland
} from '@/lib/editor-utils';

const EDITOR_ISLAND_SELECTOR = '[data-editor-island]';
const MODIFIER_ATTR = 'data-modifier-id';

async function initEditorIsland(root: HTMLElement) {
    if (!root || root.dataset.initialized === 'true') return;
    root.dataset.initialized = 'true';

    await autoRegisterAll();

    root.addEventListener('click', async (ev) => {
        const target = ev.target as HTMLElement | null;
        const btn = target?.closest(`[${MODIFIER_ATTR}]`) as HTMLElement | null;
        const modId = btn?.getAttribute(MODIFIER_ATTR);
        if (!btn || !modId) return;

        ev.preventDefault();

        const editor = findEditor();
        if (!editor) return;
        if (!isSelectionInsideEditor(editor)) {
            root.dispatchEvent(
                new CustomEvent('transform:failed', { detail: { reason: 'selection-not-inside-editor' } })
            );
            return;
        }

        const selected = getSelectedText();
        if (!selected) {
            root.dispatchEvent(new CustomEvent('transform:failed', { detail: { reason: 'no-selection' } }));
            return;
        }

        let args: Record<string, unknown> = {};
        const raw = btn.dataset.args;
        if (raw) {
            try {
                args = JSON.parse(raw);
            } catch {
                console.warn('Invalid JSON in data-args:', raw);
            }
        }
        if (Object.keys(args).length === 0) args = collectArgsFromIsland(root);

        try {
            const result = applyModifierById(modId, selected, args);
            replaceSelectionWithText(editor, result);
            root.dispatchEvent(
                new CustomEvent('transform:applied', { detail: { id: modId, args, original: selected, result } })
            );
        } catch (error) {
            console.error('applyModifierById error', error);
            root.dispatchEvent(new CustomEvent('transform:failed', { detail: { reason: 'apply-error', error } }));
        }
    });
}

function initAll() {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(EDITOR_ISLAND_SELECTOR));
    for (const n of nodes) initEditorIsland(n).catch((e) => console.error('initEditorIsland error', e));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll, { once: true });
} else {
    initAll();
}
