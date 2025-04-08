import { JwtModuleOptions } from '@nestjs/jwt';

export const getJwtConfig = async (): Promise<JwtModuleOptions> => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set!');
  }
  return {
    secret,
    // При необходимости можно добавить дополнительные опции, например:
    // signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '120m' },
  };
};
