import { Test, TestingModule } from '@nestjs/testing';
import { TournamentsService } from './tournaments.service';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('TournamentsService', () => {
  let service: TournamentsService;
  let tournamentModel: any;

  const mockTournament = {
    _id: new Types.ObjectId(),
    createdBy: new Types.ObjectId('507f1f77bcf86cd799439011'),
    players: [new Types.ObjectId('507f1f77bcf86cd799439011')],
    numberOfPlayers: 4,
    save: jest.fn(),
  };

  const tournamentArray = [mockTournament];

  beforeEach(async () => {
    // Mock the constructor function
    const tournamentModelMock: any = jest.fn(); // constructor

    // Add static methods to the constructor function
    tournamentModelMock.find = jest.fn().mockReturnThis();
    tournamentModelMock.findById = jest.fn();
    tournamentModelMock.deleteOne = jest.fn();
    tournamentModelMock.populate = jest.fn().mockReturnThis();
    tournamentModelMock.exec = jest.fn();
    tournamentModelMock.save = jest.fn();

    tournamentModel = tournamentModelMock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentsService,
        { provide: getModelToken('Tournament'), useValue: tournamentModel },
      ],
    }).compile();

    service = module.get<TournamentsService>(TournamentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTournament', () => {
    it('should create and save a tournament', async () => {
      const data = { name: 'T1' };
      const userId = '507f1f77bcf86cd799439011';
      const saveMock = jest.fn().mockResolvedValue(mockTournament);

      // Mock the constructor to return an object with save
      (tournamentModel as any).mockImplementation(() => ({
        ...data,
        createdBy: userId,
        players: [userId],
        save: saveMock,
      }));

      const result = await service.createTournament(data, userId);
      expect(result).toEqual(mockTournament);
      expect(saveMock).toHaveBeenCalled();
    });

    it('should call save with correct tournament data', async () => {
      const data = { name: 'T2', sport: 'padel', location: 'Paris', date: new Date() };
      const userId = '507f1f77bcf86cd799439012';
      const saveMock = jest.fn().mockResolvedValue({ ...data, _id: 'id', createdBy: userId, players: [userId] });

      (tournamentModel as any).mockImplementation((tournamentData: any) => ({
        ...tournamentData,
        save: saveMock,
      }));

      await service.createTournament(data, userId);
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe('getAllTournaments', () => {
    it('should return tournaments with filters', async () => {
      tournamentModel.exec.mockResolvedValue(tournamentArray);
      const filters = { sport: 'padel', city: 'Paris', date: '2024-06-01' };
      const result = await service.getAllTournaments(filters);
      expect(result).toEqual(tournamentArray);
      expect(tournamentModel.find).toHaveBeenCalled();
      expect(tournamentModel.populate).toHaveBeenCalled();
    });

    it('should return tournaments with no filters', async () => {
      tournamentModel.exec.mockResolvedValue(tournamentArray);
      const result = await service.getAllTournaments({});
      expect(result).toEqual(tournamentArray);
      expect(tournamentModel.find).toHaveBeenCalled();
      expect(tournamentModel.populate).toHaveBeenCalled();
    });
  });

  describe('deleteTournament', () => {
    it('should delete tournament if user is creator', async () => {
      tournamentModel.findById.mockResolvedValue({
        ...mockTournament,
        createdBy: new Types.ObjectId('507f1f77bcf86cd799439011'),
      });
      tournamentModel.deleteOne.mockResolvedValue({ deletedCount: 1 });
      const result = await service.deleteTournament(
        mockTournament._id.toString(),
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual({ message: 'Tournament deleted successfully' });
    });

    it('should throw NotFoundException if tournament not found', async () => {
      tournamentModel.findById.mockResolvedValue(null);
      await expect(
        service.deleteTournament('notfoundid', 'user'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user is not creator', async () => {
      tournamentModel.findById.mockResolvedValue({
        ...mockTournament,
        createdBy: new Types.ObjectId('507f1f77bcf86cd799439012'),
      });
      await expect(
        service.deleteTournament(
          mockTournament._id.toString(),
          '507f1f77bcf86cd799439011',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('joinTournament', () => {
    it('should join tournament if not already joined and not full', async () => {
      const tournament = {
        ...mockTournament,
        players: [new Types.ObjectId('507f1f77bcf86cd799439011')],
        numberOfPlayers: 4,
        save: jest.fn().mockResolvedValue(mockTournament),
      };
      tournamentModel.findById.mockResolvedValue(tournament);
      const userId = '507f1f77bcf86cd799439013';
      tournament.players = [new Types.ObjectId('507f1f77bcf86cd799439011')];
      const result = await service.joinTournament(
        mockTournament._id.toString(),
        userId,
      );
      expect(result).toEqual(mockTournament);
    });

    it('should throw NotFoundException if tournament not found', async () => {
      tournamentModel.findById.mockResolvedValue(null);
      await expect(
        service.joinTournament('notfoundid', 'user'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already joined', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const tournament = {
        ...mockTournament,
        players: [new Types.ObjectId(userId)],
      };
      tournamentModel.findById.mockResolvedValue(tournament);
      await expect(
        service.joinTournament(mockTournament._id.toString(), userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if tournament is full', async () => {
      const userId = '507f1f77bcf86cd799439014';
      const tournament = {
        ...mockTournament,
        players: [
          new Types.ObjectId(),
          new Types.ObjectId(),
          new Types.ObjectId(),
          new Types.ObjectId(),
        ],
        numberOfPlayers: 4,
      };
      tournamentModel.findById.mockResolvedValue(tournament);
      await expect(
        service.joinTournament(mockTournament._id.toString(), userId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserTournaments', () => {
    it('should return tournaments for user', async () => {
      tournamentModel.find.mockReturnValueOnce(tournamentArray);
      const userId = '507f1f77bcf86cd799439011';
      const result = await service.getUserTournaments(userId);
      expect(result).toEqual(tournamentArray);
      expect(tournamentModel.find).toHaveBeenCalledWith({
        players: new Types.ObjectId(userId),
      });
    });

    it('should return empty array if user has no tournaments', async () => {
      tournamentModel.find.mockReturnValueOnce([]);
      const userId = '507f1f77bcf86cd799439099';
      const result = await service.getUserTournaments(userId);
      expect(result).toEqual([]);
      expect(tournamentModel.find).toHaveBeenCalledWith({
        players: new Types.ObjectId(userId),
      });
    });
  });
});
