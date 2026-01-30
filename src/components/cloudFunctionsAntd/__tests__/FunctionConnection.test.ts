import {buildArgumentId, FunctionConnection, isValidArgumentId, parseArgumentId} from '../FunctionConnection';

describe('parseArgumentId', () => {
    it('parses valid argument ID', () => {
        const result = parseArgumentId('func-123-arg-0');
        expect(result).toEqual({functionId: 'func-123', argIndex: 0});
    });

    it('parses argument ID with UUID function ID', () => {
        const result = parseArgumentId('b0d8d414-fc58-45c8-a3e1-2b66b77a9dbc-arg-1');
        expect(result).toEqual({functionId: 'b0d8d414-fc58-45c8-a3e1-2b66b77a9dbc', argIndex: 1});
    });

    it('parses argument ID with multi-digit index', () => {
        const result = parseArgumentId('func-id-arg-12');
        expect(result).toEqual({functionId: 'func-id', argIndex: 12});
    });

    it('throws for missing -arg- suffix', () => {
        expect(() => parseArgumentId('func-123')).toThrow('Invalid argument ID format');
    });

    it('throws for malformed argument ID', () => {
        expect(() => parseArgumentId('func-123-arg-')).toThrow('Invalid argument ID format');
    });

    it('throws for non-numeric index', () => {
        expect(() => parseArgumentId('func-123-arg-abc')).toThrow('Invalid argument ID format');
    });
});

describe('buildArgumentId', () => {
    it('builds valid argument ID', () => {
        expect(buildArgumentId('func-123', 0)).toBe('func-123-arg-0');
    });

    it('builds argument ID with UUID', () => {
        expect(buildArgumentId('b0d8d414-fc58-45c8-a3e1-2b66b77a9dbc', 1))
            .toBe('b0d8d414-fc58-45c8-a3e1-2b66b77a9dbc-arg-1');
    });

    it('throws for negative index', () => {
        expect(() => buildArgumentId('func', -1)).toThrow('Invalid argument index');
    });

    it('throws for non-integer index', () => {
        expect(() => buildArgumentId('func', 1.5)).toThrow('Invalid argument index');
    });
});

describe('isValidArgumentId', () => {
    it('returns true for valid argument IDs', () => {
        expect(isValidArgumentId('func-arg-0')).toBe(true);
        expect(isValidArgumentId('b0d8d414-fc58-45c8-a3e1-2b66b77a9dbc-arg-1')).toBe(true);
        expect(isValidArgumentId('simple-arg-99')).toBe(true);
    });

    it('returns false for invalid argument IDs', () => {
        expect(isValidArgumentId('func-123')).toBe(false);
        expect(isValidArgumentId('arg-0')).toBe(false);
        expect(isValidArgumentId('func-arg-')).toBe(false);
        expect(isValidArgumentId('')).toBe(false);
    });
});

describe('FunctionConnection', () => {
    it('inputArgumentId returns proper format', () => {
        const conn = new FunctionConnection('out-func', 'target-func', 2);
        expect(conn.inputArgumentId).toBe('target-func-arg-2');
    });

    it('fromArgumentId creates connection correctly', () => {
        const conn = FunctionConnection.fromArgumentId('out-func', 'target-func-arg-3');
        expect(conn.outFunctionId).toBe('out-func');
        expect(conn.targetFunctionId).toBe('target-func');
        expect(conn.targetArgIndex).toBe(3);
    });

    it('fromArgumentId throws for invalid argument ID', () => {
        expect(() => FunctionConnection.fromArgumentId('out', 'invalid-id'))
            .toThrow('Invalid argument ID format');
    });

    it('roundtrip: inputArgumentId -> fromArgumentId preserves data', () => {
        const original = new FunctionConnection('out', 'target', 5);
        const argId = original.inputArgumentId;
        const restored = FunctionConnection.fromArgumentId('out', argId);

        expect(restored.outFunctionId).toBe(original.outFunctionId);
        expect(restored.targetFunctionId).toBe(original.targetFunctionId);
        expect(restored.targetArgIndex).toBe(original.targetArgIndex);
    });
});
