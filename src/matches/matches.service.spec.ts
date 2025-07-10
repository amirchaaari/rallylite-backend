import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';
import { getModelToken } from '@nestjs/mongoose';
import { Match } from './schemas/match.schema';
import { NotificationsGateway } from './notifications.gateway';
import { Types } from 'mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MatchesService', () => {
  let service: MatchesService;
  let matchModel: any;
  let notificationsGateway: any;

  beforeEach(async () => {
    // Create mock functions
    matchModel = {
      findById: jest.fn(),
      deleteOne: jest.fn(),
      find: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    notificationsGateway = {
      sendJoinRequestNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        {
          provide: getModelToken(Match.name),
          useValue: matchModel,
        },
        {
          provide: NotificationsGateway,
          useValue: notificationsGateway,
        },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
  });

  describe('createMatch', () => {
    it('should create a match with user as creator and player', async () => {
      const userId = new Types.ObjectId().toString();
      const data = { sport: 'padel', location: 'Paris' };

      const save = jest.fn().mockResolvedValue('mockSavedMatch');
      const matchConstructor = jest.fn().mockImplementation(() => ({ save }));
      (service as any).matchModel = matchConstructor;

      const result = await service.createMatch(data, userId);

      expect(matchConstructor).toHaveBeenCalledWith({
        ...data,
        createdBy: new Types.ObjectId(userId),
        players: [new Types.ObjectId(userId)],
      });
      expect(result).toBe('mockSavedMatch');
    });
  });

  describe('deleteMatch', () => {
    it('should delete match if user is creator', async () => {
      const matchId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const match = { _id: matchId, createdBy: userId };

      matchModel.findById.mockResolvedValue(match);
      matchModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await service.deleteMatch(matchId, userId);
      expect(result).toEqual({ message: 'Match deleted successfully' });
    });

    it('should throw if match not found', async () => {
      matchModel.findById.mockResolvedValue(null);
      await expect(service.deleteMatch('id', 'user')).rejects.toThrow(NotFoundException);
    });

    it('should throw if user is not creator', async () => {
      const match = { _id: 'id', createdBy: 'anotherUser' };
      matchModel.findById.mockResolvedValue(match);
      await expect(service.deleteMatch('id', 'user')).rejects.toThrow(BadRequestException);
    });
  });

  describe('requestToJoin', () => {
    it('should send request and notify host', async () => {
      const matchId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const match = {
        _id: matchId,
        players: [],
        joinRequests: [],
        location: 'Paris',
        sport: 'Padel',
        date: new Date(),
        createdBy: { _id: new Types.ObjectId() },
        save: jest.fn(),
      };

      matchModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(match),
      });

      const result = await service.requestToJoin(matchId, userId);

      expect(match.save).toHaveBeenCalled();
      expect(notificationsGateway.sendJoinRequestNotification).toHaveBeenCalledWith(
        match.createdBy._id.toString(),
        expect.objectContaining({ matchId: match._id, requester: { _id: userId } })
      );
      expect(result).toBe(match);
    });
  });
});
