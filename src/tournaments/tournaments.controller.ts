import {
  Controller, Post, Get, Body, Param, Query, UseGuards, Req
} from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTournament(@Body() body: any, @Req() req: any) {
    return this.tournamentsService.createTournament(body, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getTournaments(@Query() filters: any) {
    return this.tournamentsService.getAllTournaments(filters);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  async joinTournament(@Param('id') tournamentId: string, @Req() req: any) {
    return this.tournamentsService.joinTournament(tournamentId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyTournaments(@Req() req: any) {
    return this.tournamentsService.getUserTournaments(req.user.userId);
  }
}
