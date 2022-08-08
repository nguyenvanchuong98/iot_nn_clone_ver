import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LichSuTruyCapPage } from './lich-su-truy-cap.page';

describe('LichSuTruyCapPage', () => {
  let component: LichSuTruyCapPage;
  let fixture: ComponentFixture<LichSuTruyCapPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LichSuTruyCapPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LichSuTruyCapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
