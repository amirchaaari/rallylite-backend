import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tournament, TournamentDocument } from './schemas/tournament.schema';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectModel(Tournament.name) private tournamentModel: Model<TournamentDocument>
  ) {}

  async createTournament(data: any, userId: string) {
    const tournament = new this.tournamentModel({
      ...data,
      createdBy: new Types.ObjectId(userId),
      players: [new Types.ObjectId(userId)],
    });
    return tournament.save();
  }

  async getAllTournaments(filters: any = {}) {
    const query: any = {};

    if (filters.sport) query.sport = filters.sport;
    if (filters.city) query.location = { $regex: filters.city, $options: 'i' };
    if (filters.date) {
      const start = new Date(filters.date);
      const end = new Date(filters.date);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }

    return this.tournamentModel.find(query).populate('players', 'name email').exec();
  }

  async joinTournament(tournamentId: string, userId: string) {
    const tournament = await this.tournamentModel.findById(tournamentId);
    if (!tournament) throw new NotFoundException('Tournament not found');

    if (tournament.players.some(p => p.toString() === userId)) {
      throw new BadRequestException('You already joined this tournament');
    }

    if (tournament.players.length >= tournament.numberOfPlayers) {
      throw new BadRequestException('Tournament is full');
    }

    tournament.players.push(new Types.ObjectId(userId));
    return tournament.save();
  }

  async getUserTournaments(userId: string) {
    return this.tournamentModel.find({ players: new Types.ObjectId(userId) });
  }
}
