import {
  Controller, Post, Body, Get, Param, Query, UseGuards, Req
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createMatch(@Body() body: any, @Req() req: any) {
    return this.matchesService.createMatch(body, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMatches(@Query() filters: any) {
    return this.matchesService.getAllMatches(filters);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  async joinMatch(@Param('id') matchId: string, @Req() req: any) {
    return this.matchesService.joinMatch(matchId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyMatches(@Req() req: any) {
    return this.matchesService.getUserMatches(req.user.userId);
  }
}
