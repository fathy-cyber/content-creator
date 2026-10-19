import { Permission } from './types';

/**
 * PolicyEngine evaluates permission conditions against a given context.
 */
export class PolicyEngine {
    /**
     * Evaluates a condition object.
     * Example: { field: 'status', operator: 'not_in', values: ['approved', 'published'] }
     */
    evaluateConditions(conditions: any, context: Record<string, unknown>): boolean {
        if (!conditions || Object.keys(conditions).length === 0) return true;

        // Conditions is expected to be an array of condition objects
        const conds = Array.isArray(conditions) ? conditions : [conditions];

        return conds.every(cond => {
            const { field, operator, values } = cond;
            const actualValue = context[field];

            switch (operator) {
                case 'equals':
                    return actualValue === values;
                case 'not_equals':
                    return actualValue !== values;
                case 'in':
                    return Array.isArray(values) && values.includes(actualValue);
                case 'not_in':
                    return Array.isArray(values) && !values.includes(actualValue);
                case 'greater_than':
                    return actualValue > values;
                case 'less_than':
                    return actualValue < values;
                default:
                    console.warn(`[PolicyEngine] Unsupported operator: ${operator}`);
                    return false;
            }
        });
    }

    /**
     * Checks if any of the user's permissions match the requested action.
     */
    hasPermission(permissions: Permission[], module: string, resource: string, action: string): boolean {
        return permissions.some(p => 
            p.module === module && 
            p.resource === resource && 
            p.action === action
        );
    }
}

export const policyEngine = new PolicyEngine();
