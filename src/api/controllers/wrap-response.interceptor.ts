import { Action, Interceptor, InterceptorInterface } from "routing-controllers";
import { Service } from "typedi";

@Interceptor()
@Service()
export class WrapResponseInterceptor implements InterceptorInterface {
  intercept(_action: Action, content: any): any {
    return { data: content };
  }
}
