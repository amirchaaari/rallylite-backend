import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with body and return result', async () => {
      const body = { email: 'test@test.com', password: '123456' };
      const result = { id: 1, email: 'test@test.com' };
      mockAuthService.register.mockResolvedValue(result);

      expect(await controller.register(body)).toEqual(result);
      expect(authService.register).toHaveBeenCalledWith(body);
    });
  });

  describe('login', () => {
    it('should throw error if user is not validated', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);
      await expect(controller.login({ email: 'a', password: 'b' }))
        .rejects
        .toThrow('Invalid credentials');
    });

    it('should return login result if user is validated', async () => {
      const user = { id: 1, email: 'test@test.com' };
      const loginResult = { accessToken: 'token' };
      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue(loginResult);

      const result = await controller.login({ email: 'test@test.com', password: '123456' });
      expect(result).toEqual(loginResult);
      expect(authService.validateUser).toHaveBeenCalledWith('test@test.com', '123456');
      expect(authService.login).toHaveBeenCalledWith(user);
    });
  });
});

// We recommend installing an extension to run jest tests.
