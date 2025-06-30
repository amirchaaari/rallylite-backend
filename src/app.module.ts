import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MatchesModule } from './matches/matches.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [ MongooseModule.forRoot('mongodb://localhost:27017/rallylite'),AuthModule, UsersModule, MatchesModule, TournamentsModule, CommonModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
