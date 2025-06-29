// src/common/decorators/site.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IpAddress = createParamDecorator((_, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return (req as any).ipAddress ?? req.body?.ipAddress ?? req.query?.ipAddress;
});

export const Site = createParamDecorator((_, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return (req as any).site ?? req.body?.site ?? req.query?.site;
});

export const Username = createParamDecorator((_, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return (req as any).username ?? req.body?.username ?? req.query?.username;
});
