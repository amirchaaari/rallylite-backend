// tournaments.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';

describe('TournamentsController', () => {
  let controller: TournamentsController;
  let tournamentsService: TournamentsService;

  const mockTournamentsService = {
    createTournament: jest.fn(),
    getAllTournaments: jest.fn(),
    deleteTournament: jest.fn(),
    joinTournament: jest.fn(),
    getUserTournaments: jest.fn(),
  };

  const mockReq = { user: { userId: 'user123' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TournamentsController],
      providers: [
        { provide: TournamentsService, useValue: mockTournamentsService },
      ],
    }).compile();

    controller = module.get<TournamentsController>(TournamentsController);
    tournamentsService = module.get<TournamentsService>(TournamentsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTournament', () => {
    it('should call tournamentsService.createTournament with body and userId', async () => {
      const body = { name: 'Tournament 1' };
      const result = { id: '1', ...body };
      mockTournamentsService.createTournament.mockResolvedValue(result);

      expect(await controller.createTournament(body, mockReq)).toEqual(result);
      expect(tournamentsService.createTournament).toHaveBeenCalledWith(body, 'user123');
    });
  });

  describe('getTournaments', () => {
    it('should call tournamentsService.getAllTournaments with filters', async () => {
      const filters = { status: 'open' };
      const result = [{ id: '1' }];
      mockTournamentsService.getAllTournaments.mockResolvedValue(result);

      expect(await controller.getTournaments(filters)).toEqual(result);
      expect(tournamentsService.getAllTournaments).toHaveBeenCalledWith(filters);
    });
  });

  describe('deleteTournament', () => {
    it('should call tournamentsService.deleteTournament with tournamentId and userId', async () => {
      const tournamentId = 't1';
      const result = { deleted: true };
      mockTournamentsService.deleteTournament.mockResolvedValue(result);

      expect(await controller.deleteTournament(tournamentId, mockReq)).toEqual(result);
      expect(tournamentsService.deleteTournament).toHaveBeenCalledWith(tournamentId, 'user123');
    });
  });

  describe('joinTournament', () => {
    it('should call tournamentsService.joinTournament with tournamentId and userId', async () => {
      const tournamentId = 't1';
      const result = { joined: true };
      mockTournamentsService.joinTournament.mockResolvedValue(result);

      expect(await controller.joinTournament(tournamentId, mockReq)).toEqual(result);
      expect(tournamentsService.joinTournament).toHaveBeenCalledWith(tournamentId, 'user123');
    });
  });

  describe('getMyTournaments', () => {
    it('should call tournamentsService.getUserTournaments with userId', async () => {
      const result = [{ id: '1' }];
      mockTournamentsService.getUserTournaments.mockResolvedValue(result);

      expect(await controller.getMyTournaments(mockReq)).toEqual(result);
      expect(tournamentsService.getUserTournaments).toHaveBeenCalledWith('user123');
    });
  });
});
