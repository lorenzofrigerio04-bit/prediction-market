import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { foundationSchemas } from "../../schemas/index.js";
const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    allowUnionTypes: true,
});
addFormats(ajv);
for (const schema of foundationSchemas) {
    ajv.addSchema(schema);
}
export { ajv };
//# sourceMappingURL=ajv-instance.js.map