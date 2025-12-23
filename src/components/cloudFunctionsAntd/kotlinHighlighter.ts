export const highlightKotlin = (code: string) => {
    const tokens: { text: string; color: string }[] = [];
    const keywords = new Set(['fun', 'val', 'var', 'if', 'else', 'when', 'for', 'while', 'return', 'class', 'interface', 'object', 'companion', 'override', 'private', 'public', 'internal', 'protected']);
    const types = new Set(['String', 'Int', 'Long', 'Double', 'Float', 'Boolean', 'Unit', 'Any', 'Nothing', 'List', 'Map', 'Set', 'Array']);

    let i = 0;
    while (i < code.length) {
        // String literals
        if (code[i] === '"') {
            let end = i + 1;
            while (end < code.length && code[end] !== '"') {
                if (code[end] === '\\') end++;
                end++;
            }
            tokens.push({ text: code.slice(i, end + 1), color: '#98c379' });
            i = end + 1;
            continue;
        }

        // Words (keywords, types, identifiers)
        if (/[a-zA-Z_]/.test(code[i])) {
            let end = i;
            while (end < code.length && /[a-zA-Z0-9_]/.test(code[end])) end++;
            const word = code.slice(i, end);
            const nextChar = code[end];

            if (keywords.has(word)) {
                tokens.push({ text: word, color: '#c678dd' });
            } else if (types.has(word)) {
                tokens.push({ text: word, color: '#e5c07b' });
            } else if (nextChar === '(') {
                tokens.push({ text: word, color: '#61afef' });
            } else {
                tokens.push({ text: word, color: '#abb2bf' });
            }
            i = end;
            continue;
        }

        // Special characters
        if ('{}()[]'.includes(code[i])) {
            tokens.push({ text: code[i], color: '#abb2bf' });
            i++;
            continue;
        }

        if (';:,'.includes(code[i])) {
            tokens.push({ text: code[i], color: '#abb2bf' });
            i++;
            continue;
        }

        if (code[i] === '?') {
            tokens.push({ text: '?', color: '#e06c75' });
            i++;
            continue;
        }

        // Default (whitespace, other)
        tokens.push({ text: code[i], color: '#abb2bf' });
        i++;
    }

    return tokens.map(t => `<span style="color:${t.color}">${t.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`).join('');
};
