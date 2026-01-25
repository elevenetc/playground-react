/**
 * Translates simple Kotlin functions to JavaScript.
 * Supports only single-line functions with primitive types.
 */

export type TranslationResult =
    | { success: true; jsCode: string }
    | { success: false; error: string };

/**
 * Extracts the function body from Kotlin source code.
 * Supports both block body `{ return expr }` and expression body `= expr`
 */
function extractBody(source: string): string | null {
    // Expression body: fun add(a: Int, b: Int): Int = a + b
    const expressionBodyMatch = source.match(/\)\s*(?::\s*\w+\??)?\s*=\s*(.+)$/);
    if (expressionBodyMatch) {
        return expressionBodyMatch[1].trim();
    }

    // Block body: fun add(a: Int, b: Int): Int { return a + b }
    const blockBodyMatch = source.match(/\{([^}]*)\}/);
    if (blockBodyMatch) {
        const body = blockBodyMatch[1].trim();
        // Extract expression from "return expr"
        const returnMatch = body.match(/^return\s+(.+)$/);
        if (returnMatch) {
            return returnMatch[1].trim();
        }
        // No return statement - likely a Unit function
        return body || null;
    }

    return null;
}

/**
 * Translates a Kotlin expression to JavaScript.
 * Handles basic primitives and arithmetic.
 */
function translateExpression(expr: string): string {
    let result = expr;

    // Kotlin true/false are same as JS
    // Kotlin arithmetic operators are same as JS: + - * / %

    // String concatenation with $ templates: "Hello $name" -> `Hello ${name}`
    result = result.replace(/"([^"]*)"/g, (match, content) => {
        if (content.includes('$')) {
            // Convert Kotlin string template to JS template literal
            const converted = content
                .replace(/\$\{([^}]+)\}/g, '${$1}')  // ${expr} stays same
                .replace(/\$(\w+)/g, '${$1}');        // $var -> ${var}
            return '`' + converted + '`';
        }
        return match;
    });

    // Kotlin Int division is same as JS for integers
    // Kotlin .toInt(), .toString() etc -> JS Number(), String()
    result = result.replace(/\.toInt\(\)/g, '|0');
    result = result.replace(/\.toLong\(\)/g, '');
    result = result.replace(/\.toDouble\(\)/g, '');
    result = result.replace(/\.toFloat\(\)/g, '');
    result = result.replace(/\.toString\(\)/g, '.toString()');

    // Kotlin Float literals: 1.0f -> 1.0
    result = result.replace(/(\d+\.?\d*)f\b/g, '$1');

    // Kotlin Long literals: 1L -> 1
    result = result.replace(/(\d+)L\b/g, '$1');

    return result;
}

/**
 * Translates a Kotlin function to a JavaScript function.
 * Returns the JS code as a string that can be evaluated with Function().
 */
export function translateKotlinToJs(
    kotlinSource: string,
    paramNames: string[]
): TranslationResult {
    const body = extractBody(kotlinSource);

    if (body === null) {
        return {
            success: false,
            error: 'Could not extract function body'
        };
    }

    if (body === '') {
        // Unit function with empty body
        return {
            success: true,
            jsCode: `return undefined;`
        };
    }

    const jsExpression = translateExpression(body);

    return {
        success: true,
        jsCode: `return ${jsExpression};`
    };
}

/**
 * Evaluates a translated Kotlin function with given arguments.
 */
export function evaluateKotlinFunction(
    kotlinSource: string,
    paramNames: string[],
    paramValues: unknown[]
): unknown {
    const translation = translateKotlinToJs(kotlinSource, paramNames);

    if (!translation.success) {
        throw new Error(`Translation failed: ${translation.error}`);
    }

    // Create a function with the parameter names and body
    const fn = new Function(...paramNames, translation.jsCode);

    return fn(...paramValues);
}
