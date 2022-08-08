import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThietLapLuatCanhBaoPage } from './thiet-lap-luat-canh-bao.page';

describe('ThietLapLuatCanhBaoPage', () => {
  let component: ThietLapLuatCanhBaoPage;
  let fixture: ComponentFixture<ThietLapLuatCanhBaoPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThietLapLuatCanhBaoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThietLapLuatCanhBaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
