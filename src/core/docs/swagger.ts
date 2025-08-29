import { AuthController, BankAccountController, FinancesController } from "@/api/controllers";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { getMetadataArgsStorage } from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";

const schemas = validationMetadatasToSchemas({
  refPointerPrefix: "#/components/schemas/",
});

const storage = getMetadataArgsStorage();
const spec = routingControllersToSpec(
  storage,
  {
    controllers: [AuthController, BankAccountController, FinancesController],
  },
  {
    components: { schemas },
    info: {
      title: "My API",
      description: "API documentation",
      version: "1.0.0",
    },
  },
);

export default spec;
