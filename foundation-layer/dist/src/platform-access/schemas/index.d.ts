import { accessScopeSchema } from "./access-scope.schema.js";
import { actionPermissionCheckSchema } from "./action-permission-check.schema.js";
import { adminCapabilityFlagSchema } from "./admin-capability-flag.schema.js";
import { authorizationDecisionSchema } from "./authorization-decision.schema.js";
import { permissionPolicySchema } from "./permission-policy.schema.js";
import { platformActionCompatibilitySchema } from "./platform-action-compatibility.schema.js";
import { roleAssignmentSchema } from "./role-assignment.schema.js";
import { roleDefinitionSchema } from "./role-definition.schema.js";
import { userIdentitySchema } from "./user-identity.schema.js";
import { workspaceSchema } from "./workspace.schema.js";
export declare const platformAccessSchemas: readonly [{
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/user-identity.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "display_name", "user_type", "status", "primary_workspace_id_nullable", "capability_flags", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^usr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly display_name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly user_type: {
            readonly type: "string";
            readonly enum: import("../index.js").UserType[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").UserStatus[];
        };
        readonly primary_workspace_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly capability_flags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
        readonly metadata: {
            readonly type: "object";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/workspace.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "workspace_key", "display_name", "workspace_type", "status", "governance_metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly workspace_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly display_name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly workspace_type: {
            readonly type: "string";
            readonly enum: import("../index.js").WorkspaceType[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").WorkspaceStatus[];
        };
        readonly governance_metadata: {
            readonly type: "object";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/role-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "role_key", "display_name", "permission_set", "role_scope_policy", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly role_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly display_name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly permission_set: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly minItems: 1;
            readonly uniqueItems: true;
        };
        readonly role_scope_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").RoleScopePolicy[];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/role-assignment.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "user_id", "role_id", "workspace_id_nullable", "access_scope", "assigned_by", "assigned_at", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^asg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly user_id: {
            readonly type: "string";
            readonly pattern: "^usr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly role_id: {
            readonly type: "string";
            readonly pattern: "^rol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly workspace_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly access_scope: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["scope_type", "workspace_id_nullable", "module_scope_nullable", "entity_scope_nullable", "notes_nullable"];
            readonly properties: {
                readonly scope_type: {
                    readonly type: "string";
                    readonly enum: import("../index.js").ScopeType[];
                };
                readonly workspace_id_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    }];
                };
                readonly module_scope_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly enum: import("../index.js").TargetModule[];
                    }];
                };
                readonly entity_scope_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly minLength: 1;
                    }];
                };
                readonly notes_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                    }];
                };
            };
        };
        readonly assigned_by: {
            readonly type: "string";
            readonly pattern: "^usr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly assigned_at: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/permission-policy.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "policy_key", "allowed_actions", "denied_actions_nullable", "scope_constraints", "policy_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^pol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly policy_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly allowed_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").ActionKey[];
            };
            readonly minItems: 1;
            readonly uniqueItems: true;
        };
        readonly denied_actions_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                    readonly enum: import("../index.js").ActionKey[];
                };
                readonly uniqueItems: true;
            }];
        };
        readonly scope_constraints: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["scope_type", "workspace_id_nullable", "module_scope_nullable", "entity_scope_nullable", "notes_nullable"];
                readonly properties: {
                    readonly scope_type: {
                        readonly type: "string";
                        readonly enum: import("../index.js").ScopeType[];
                    };
                    readonly workspace_id_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "string";
                            readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                        }];
                    };
                    readonly module_scope_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "string";
                            readonly enum: import("../index.js").TargetModule[];
                        }];
                    };
                    readonly entity_scope_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "string";
                            readonly minLength: 1;
                        }];
                    };
                    readonly notes_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "string";
                        }];
                    };
                };
            };
        };
        readonly policy_status: {
            readonly type: "string";
            readonly enum: import("../index.js").PolicyStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/access-scope.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["scope_type", "workspace_id_nullable", "module_scope_nullable", "entity_scope_nullable", "notes_nullable"];
    readonly properties: {
        readonly scope_type: {
            readonly type: "string";
            readonly enum: import("../index.js").ScopeType[];
        };
        readonly workspace_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly module_scope_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly enum: import("../index.js").TargetModule[];
            }];
        };
        readonly entity_scope_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
        readonly notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/authorization-decision.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "user_id", "requested_action", "evaluated_scope", "decision_status", "matched_roles", "matched_policies", "blocking_reasons", "evaluated_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^adz_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly user_id: {
            readonly type: "string";
            readonly pattern: "^usr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly requested_action: {
            readonly type: "string";
            readonly enum: import("../index.js").ActionKey[];
        };
        readonly evaluated_scope: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["scope_type", "workspace_id_nullable", "module_scope_nullable", "entity_scope_nullable", "notes_nullable"];
            readonly properties: {
                readonly scope_type: {
                    readonly type: "string";
                    readonly enum: import("../index.js").ScopeType[];
                };
                readonly workspace_id_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    }];
                };
                readonly module_scope_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly enum: import("../index.js").TargetModule[];
                    }];
                };
                readonly entity_scope_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly minLength: 1;
                    }];
                };
                readonly notes_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                    }];
                };
            };
        };
        readonly decision_status: {
            readonly type: "string";
            readonly enum: import("../index.js").DecisionStatus[];
        };
        readonly matched_roles: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly pattern: "^rol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            };
            readonly uniqueItems: true;
        };
        readonly matched_policies: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly pattern: "^pol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            };
            readonly uniqueItems: true;
        };
        readonly blocking_reasons: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly evaluated_at: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/action-permission-check.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "action_key", "target_module", "target_entity_type_nullable", "required_permission", "decision_ref", "check_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^chk_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly action_key: {
            readonly type: "string";
            readonly enum: import("../index.js").ActionKey[];
        };
        readonly target_module: {
            readonly type: "string";
            readonly enum: import("../index.js").TargetModule[];
        };
        readonly target_entity_type_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
        readonly required_permission: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly decision_ref: {
            readonly type: "string";
            readonly pattern: "^adz_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly check_status: {
            readonly type: "string";
            readonly enum: import("../index.js").CheckStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/admin-capability-flag.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["flag_key", "description", "sensitive", "default_enabled"];
    readonly properties: {
        readonly flag_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly description: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly sensitive: {
            readonly type: "boolean";
        };
        readonly default_enabled: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/platform-action-compatibility.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_module", "action_key", "required_scope_type", "required_capabilities_nullable", "notes_nullable", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^pac_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_module: {
            readonly type: "string";
            readonly enum: import("../index.js").TargetModule[];
        };
        readonly action_key: {
            readonly type: "string";
            readonly enum: import("../index.js").ActionKey[];
        };
        readonly required_scope_type: {
            readonly type: "string";
            readonly enum: import("../index.js").ScopeType[];
        };
        readonly required_capabilities_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly uniqueItems: true;
            }];
        };
        readonly notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
            }];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
}];
export { accessScopeSchema, actionPermissionCheckSchema, adminCapabilityFlagSchema, authorizationDecisionSchema, permissionPolicySchema, platformActionCompatibilitySchema, roleAssignmentSchema, roleDefinitionSchema, userIdentitySchema, workspaceSchema, };
export * from "./user-identity.schema.js";
export * from "./workspace.schema.js";
export * from "./role-definition.schema.js";
export * from "./role-assignment.schema.js";
export * from "./permission-policy.schema.js";
export * from "./access-scope.schema.js";
export * from "./authorization-decision.schema.js";
export * from "./action-permission-check.schema.js";
export * from "./admin-capability-flag.schema.js";
export * from "./platform-action-compatibility.schema.js";
//# sourceMappingURL=index.d.ts.map