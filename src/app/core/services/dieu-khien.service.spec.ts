import { TestBed } from '@angular/core/testing';

import { DieuKhienService } from './dieu-khien.service';

describe('DieuKhienService', () => {
  let service: DieuKhienService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DieuKhienService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
