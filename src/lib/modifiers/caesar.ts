export const id = 'caesar.shift' as const;

function shiftAsciiLetter(cp: number, n: number): number | undefined {
    // Uppercase A-Z
    if (cp >= 65 && cp <= 90) return ((((cp - 65 + n) % 26) + 26) % 26) + 65;
    // Lowercase a-z
    if (cp >= 97 && cp <= 122) return ((((cp - 97 + n) % 26) + 26) % 26) + 97;
    return undefined;
}

export function caesarShift(text: string, shift = 5): string {
    const n = Number.isFinite(Number(shift)) ? Number(shift) : 5;
    return Array.from(String(text))
        .map((ch) => {
            const cp = ch.codePointAt(0);
            if (cp === undefined) return ch;
            const shifted = shiftAsciiLetter(cp, n);
            return shifted === undefined ? ch : String.fromCodePoint(shifted);
        })
        .join('');
}

export const descriptor = {
    meta: {
        id,
        name: 'Caesar Shift',
        category: 'alphabet',
        defaultMode: 'flatten',
        args: [{ key: 'shift', type: 'number', default: 5 }]
    },
    apply: (text: string, args: { shift?: number } = {}) => caesarShift(text, args.shift ?? 5)
};
