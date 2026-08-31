import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { AuthService } from '../../auth.service';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return false;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return false;
    }
    try {
      const { userId } = await firstValueFrom(
        this.authService.validateToken(token),
      );
      request.user = { id: String(userId) };
      return true;
    } catch {
      return false;
    }
  }
}
