import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

async login(user: any) {
  const payload = { email: user.email, sub: user._id, roles: user.roles };

  return {
    access_token: this.jwtService.sign(payload),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      photoUrl: user.photoUrl || null,
    },
  };
}

  async register(data: any) {
    const existing = await this.usersService.findByEmail(data.email);
    if (existing) throw new UnauthorizedException('Email already registered');
    const hashed = await bcrypt.hash(data.password, 10);
    return this.usersService.create({ ...data, password: hashed });
  }

}
