export type ModifierDescriptor = { meta: { id: string;[k: string]: unknown }; apply: (text: string, args?: unknown) => string };

const registry = new Map<string, ModifierDescriptor>();
let registeredOnce = false;

export function registerModifier(desc: ModifierDescriptor) {
    if (!desc?.meta?.id) throw new Error('modifier.meta.id required');
    registry.set(desc.meta.id, desc);
}

export function applyModifierById(id: string, text: string, args?: any) {
    const entry = registry.get(id);
    if (!entry) throw new Error(`Modifier "${id}" not registered`);
    return entry.apply(text, args);
}

export function listModifiers() {
    return Array.from(registry.values()).map((r) => r.meta);
}

export async function autoRegisterAll() {
    if (registeredOnce) return;
    registeredOnce = true;
    const modules = import.meta.glob('./*.ts', { eager: false });

    const imports = Object.values(modules).map((loader) => (loader as () => Promise<unknown>)());

    try {
        const loaded = await Promise.all(imports);
        for (const mod of loaded as Array<any>) {
            const d: ModifierDescriptor | undefined = mod?.descriptor ?? mod?.default?.descriptor;
            if (d && typeof d.apply === 'function' && d.meta?.id) registerModifier(d);
        }
    } catch (err) {
        console.warn('autoRegisterAll: some modifiers failed to load', err);
    }
}
