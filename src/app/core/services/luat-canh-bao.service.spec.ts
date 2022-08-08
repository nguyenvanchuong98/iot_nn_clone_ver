import { TestBed } from '@angular/core/testing';

import { LuatCanhBaoService } from './luat-canh-bao.service';

describe('LuatCanhBaoService', () => {
  let service: LuatCanhBaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LuatCanhBaoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
