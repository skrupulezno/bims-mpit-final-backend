import { PrismaService } from "src/prisma/prisma.service";
import { JWT_ACCESS_SECRET } from "./auth.constants";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { memberships: true },
    });
    if (!user) {
      return null; 
    }
    
    const membership = user.memberships[0];
  
    return { 
      id: user.id, 
      role: membership?.role, 
      organizationId: membership?.companyId 
    };
  }
}
