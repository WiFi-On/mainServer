import { Test, TestingModule } from '@nestjs/testing';
import { EissdService } from 'src/eissd/eissd.service';

describe('EissdService (Integration)', () => {
  let service: EissdService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EissdService],
    }).compile();

    service = module.get<EissdService>(EissdService);
  });

  it('should return real tariff data from API', async () => {
    const result = await service.getSHPDtariffMRF('01', '1', '2', '3', '4', '5');

    console.log(result); // Выведем результат API

    expect(result).toBeDefined();
    expect(result.productAsrTariffId).toBeDefined();
    expect(result.productTariffName).toBeDefined();
  });
});
