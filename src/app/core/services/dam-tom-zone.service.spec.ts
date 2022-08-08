import { TestBed } from '@angular/core/testing';

import { DamTomZoneService } from './dam-tom-zone.service';

describe('DamTomZoneService', () => {
  let service: DamTomZoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DamTomZoneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
