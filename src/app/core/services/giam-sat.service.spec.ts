import { TestBed } from '@angular/core/testing';

import { GiamSatService } from './giam-sat.service';

describe('GiamSatService', () => {
  let service: GiamSatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GiamSatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
