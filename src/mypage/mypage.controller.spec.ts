import { Test, TestingModule } from '@nestjs/testing';
import { MyPageController } from './mypage.controller';

describe('MypageController', () => {
  let controller: MyPageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyPageController],
    }).compile();

    controller = module.get<MyPageController>(MyPageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
