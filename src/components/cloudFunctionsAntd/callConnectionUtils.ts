/**
 * Centralized utilities for managing ReactFlow handle IDs.
 * Single source of truth for handle naming conventions.
 *
 * Input handles use numeric IDs: "0", "1", "2", etc.
 * Output handle uses: "output"
 */

export const CallConnectionUtils = {
    /**
     * Create an input handle ID for a specific argument index.
     * Simply returns the index as a string.
     */
    createInputId: (index: number): string => index.toString(),

    /**
     * Create the output handle ID for return values
     */
    createOutputId: (): string => 'output',

    /**
     * Parse an input handle ID and extract the argument index.
     * Returns null if the ID is not a valid numeric string.
     */
    parseInputIndex: (handleId: string): number | null => {
        const num = parseInt(handleId, 10);
        return isNaN(num) ? null : num;
    },

    /**
     * Check if a handle ID represents an input handle (numeric string)
     */
    isInput: (handleId: string): boolean => !isNaN(parseInt(handleId, 10)),

    /**
     * Check if a handle ID represents an output handle
     */
    isOutput: (handleId: string): boolean => handleId === 'output'
} as const;
