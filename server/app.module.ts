import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { IssuesModule } from './issues/issues.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

@Module({
  imports: [IssuesModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
