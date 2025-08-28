import { Controller, Get } from "routing-controllers";
import { Service } from "typedi";

@Service()
@Controller("/health")
export class HealthController {
  @Get()
  health() {
    return { status: true, date: new Date() };
  }
}
