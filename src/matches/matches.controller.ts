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

  // Send a join request (instead of joining directly)
  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  async requestToJoin(@Param('id') matchId: string, @Req() req: any) {
    return this.matchesService.requestToJoin(matchId, req.user.userId);
  }
  //delete match
  @UseGuards(JwtAuthGuard)
  @Post(':id/delete')
  async deleteMatch(@Param('id') matchId: string, @Req() req:
  any) {
    return this.matchesService.deleteMatch(matchId, req.user.userId);
  } 

  // Accept a join request
  @UseGuards(JwtAuthGuard)
  @Post(':matchId/accept/:playerId')
  async acceptJoinRequest(
    @Param('matchId') matchId: string,
    @Param('playerId') playerId: string,
    @Req() req: any,
  ) {
    return this.matchesService.acceptJoinRequest(matchId, playerId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyMatches(@Req() req: any) {
    return this.matchesService.getUserMatches(req.user.userId);
  }
}
