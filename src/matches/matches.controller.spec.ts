import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

describe('MatchesController', () => {
  let controller: MatchesController;
  let matchesService: MatchesService;

  const mockMatchesService = {
    createMatch: jest.fn(),
    getAllMatches: jest.fn(),
    requestToJoin: jest.fn(),
    deleteMatch: jest.fn(),
    acceptJoinRequest: jest.fn(),
    getUserMatches: jest.fn(),
  };

  const mockReq = { user: { userId: 'user123' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [
        { provide: MatchesService, useValue: mockMatchesService },
      ],
    }).compile();

    controller = module.get<MatchesController>(MatchesController);
    matchesService = module.get<MatchesService>(MatchesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMatch', () => {
    it('should call matchesService.createMatch with body and userId', async () => {
      const body = { name: 'Match 1' };
      const result = { id: '1', ...body };
      mockMatchesService.createMatch.mockResolvedValue(result);

      expect(await controller.createMatch(body, mockReq)).toEqual(result);
      expect(matchesService.createMatch).toHaveBeenCalledWith(body, 'user123');
    });
  });

  describe('getMatches', () => {
    it('should call matchesService.getAllMatches with filters', async () => {
      const filters = { status: 'open' };
      const result = [{ id: '1' }];
      mockMatchesService.getAllMatches.mockResolvedValue(result);

      expect(await controller.getMatches(filters)).toEqual(result);
      expect(matchesService.getAllMatches).toHaveBeenCalledWith(filters);
    });
  });

  describe('requestToJoin', () => {
    it('should call matchesService.requestToJoin with matchId and userId', async () => {
      const matchId = 'match1';
      const result = { success: true };
      mockMatchesService.requestToJoin.mockResolvedValue(result);

      expect(await controller.requestToJoin(matchId, mockReq)).toEqual(result);
      expect(matchesService.requestToJoin).toHaveBeenCalledWith(matchId, 'user123');
    });
  });

  describe('deleteMatch', () => {
    it('should call matchesService.deleteMatch with matchId and userId', async () => {
      const matchId = 'match1';
      const result = { deleted: true };
      mockMatchesService.deleteMatch.mockResolvedValue(result);

      expect(await controller.deleteMatch(matchId, mockReq)).toEqual(result);
      expect(matchesService.deleteMatch).toHaveBeenCalledWith(matchId, 'user123');
    });
  });

  describe('acceptJoinRequest', () => {
    it('should call matchesService.acceptJoinRequest with matchId, playerId, and userId', async () => {
      const matchId = 'match1';
      const playerId = 'player1';
      const result = { accepted: true };
      mockMatchesService.acceptJoinRequest.mockResolvedValue(result);

      expect(await controller.acceptJoinRequest(matchId, playerId, mockReq)).toEqual(result);
      expect(matchesService.acceptJoinRequest).toHaveBeenCalledWith(matchId, playerId, 'user123');
    });
  });

  describe('getMyMatches', () => {
    it('should call matchesService.getUserMatches with userId', async () => {
      const result = [{ id: '1' }];
      mockMatchesService.getUserMatches.mockResolvedValue(result);

      expect(await controller.getMyMatches(mockReq)).toEqual(result);
      expect(matchesService.getUserMatches).toHaveBeenCalledWith('user123');
    });
  });
});
