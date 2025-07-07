import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Match, MatchDocument } from './schemas/match.schema';
import { NotificationsGateway } from './notifications.gateway'; // 👈 Add this

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
        private readonly notificationsGateway: NotificationsGateway // 👈 Inject

    
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

    return this.matchModel
      .find(query)
      .populate('players', 'name email level photoUrl')
      .populate('createdBy', 'name _id level photoUrl')
      .populate('joinRequests', 'name email level photoUrl')
      .exec();
  }

async requestToJoin(matchId: string, userId: string) {
  const match = await this.matchModel
    .findById(matchId)
    .populate('createdBy', 'name email level photoUrl') // 👈 Add this
    .exec();

  if (!match) throw new NotFoundException('Match not found');

  const userObjectId = new Types.ObjectId(userId);

  if (match.players.includes(userObjectId))
    throw new BadRequestException('Already a player in this match');

  if (match.joinRequests.includes(userObjectId))
    throw new BadRequestException('Join request already sent');

  match.joinRequests.push(userObjectId);
  await match.save();

  // Notify the host (createdBy)
  this.notificationsGateway.sendJoinRequestNotification(
    match.createdBy._id.toString(), // emit to host's room
    {
      matchId: match._id,
      location: match.location,
      sport: match.sport,
      date: match.date,
      requester: {
        _id: userId,
        // The frontend can fetch user profile or include it here if available
      },
    }
  );

  return match;
}


  async acceptJoinRequest(matchId: string, playerId: string, currentUserId: string) {
    const match = await this.matchModel.findById(matchId);
    if (!match) throw new NotFoundException('Match not found');

    if (match.createdBy.toString() !== currentUserId)
      throw new BadRequestException('Only the match creator can accept requests');

    const playerObjectId = new Types.ObjectId(playerId);

    if (!match.joinRequests.includes(playerObjectId))
      throw new BadRequestException('No join request from this user');

    if (match.players.includes(playerObjectId))
      throw new BadRequestException('User already joined');

    if (match.players.length >= match.maxPlayers)
      throw new BadRequestException('Match is full');

    // Add to players and remove from requests
    match.players.push(playerObjectId);
    match.joinRequests = match.joinRequests.filter(
      (id) => id.toString() !== playerId
    );

    return match.save();
  }
  
  //delete match
  async deleteMatch(matchId: string, userId: string) {
    const match = await this.matchModel.findById(matchId);
    if (!match) throw new NotFoundException('Match not found');
    if (match.createdBy.toString() !== userId)
      throw new BadRequestException('Only the match creator can delete it');
    await this.matchModel.deleteOne
({ _id: matchId });
    return { message: 'Match deleted successfully' };
  }

  async getUserMatches(userId: string) {
    return this.matchModel
      .find({ players: new Types.ObjectId(userId) })
      .populate('players', 'name email level photoUrl')
      .populate('createdBy', 'name _id level photoUrl')
      .populate('joinRequests', 'name email level photoUrl')
      .exec();
  }
}
