import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Match, MatchDocument } from './schemas/match.schema';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>
  ) {}

  async createMatch(data: any, userId: string) {
    const match = new this.matchModel({
      ...data,
      createdBy: new Types.ObjectId(userId),
      players: [new Types.ObjectId(userId)], // creator is first player
    });
    return match.save();
  }

  async getAllMatches(filters: any = {}) {
    const query: any = {};

    if (filters.sport) query.sport = filters.sport;
    if (filters.city) query.location = { $regex: filters.city, $options: 'i' };
    if (filters.date) {
      const start = new Date(filters.date);
      const end = new Date(filters.date);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }

    return this.matchModel.find(query).populate('players', 'name email level photoUrl').populate('createdBy', 'name _id level photoUrl').exec();
  }

  async joinMatch(matchId: string, userId: string) {
    const match = await this.matchModel.findById(matchId);

    if (!match) throw new NotFoundException('Match not found');

    const userObjectId = new Types.ObjectId(userId);

    if (match.players.some(p => p.toString() === userId)) {
      throw new BadRequestException('You already joined this match');
    }

    if (match.players.length >= match.maxPlayers) {
      throw new BadRequestException('Match is full');
    }

    match.players.push(userObjectId);
    return match.save();
  }

  async getUserMatches(userId: string) {
    return this.matchModel.find({
      players: new Types.ObjectId(userId),
    });
  }
}
