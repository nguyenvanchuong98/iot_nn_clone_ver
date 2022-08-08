import { TestBed } from '@angular/core/testing';

import { BaoCaoService } from './bao-cao.service';

describe('BaoCaoService', () => {
  let service: BaoCaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BaoCaoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
