import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from './schemas/match.schema';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { NotificationsGateway } from './notifications.gateway'; // 👈 Import the gateway

@Module({
  imports: [MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }])],
  controllers: [MatchesController],
  providers: [
    MatchesService,
    NotificationsGateway, // 👈 Provide the gateway
  ],
})
export class MatchesModule {}
