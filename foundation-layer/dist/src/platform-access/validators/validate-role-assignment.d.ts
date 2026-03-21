import { type ValidationReport } from "../../entities/validation-report.entity.js";
import { type ValidationOptions } from "../../validators/common/validation-result.js";
import type { RoleAssignment } from "../roles/entities/role-assignment.entity.js";
export type RoleAssignmentValidationContext = Readonly<{
    user_exists?: (userId: RoleAssignment["user_id"]) => boolean;
    role_exists?: (roleId: RoleAssignment["role_id"]) => boolean;
}>;
export declare const validateRoleAssignment: (input: RoleAssignment, options?: ValidationOptions, context?: RoleAssignmentValidationContext) => ValidationReport;
//# sourceMappingURL=validate-role-assignment.d.ts.map