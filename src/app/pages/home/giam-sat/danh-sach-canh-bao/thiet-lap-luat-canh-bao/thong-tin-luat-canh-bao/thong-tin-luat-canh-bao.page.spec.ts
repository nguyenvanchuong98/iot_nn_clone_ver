import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThongTinLuatCanhBaoPage } from './thong-tin-luat-canh-bao.page';

describe('ThongTinLuatCanhBaoPage', () => {
  let component: ThongTinLuatCanhBaoPage;
  let fixture: ComponentFixture<ThongTinLuatCanhBaoPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThongTinLuatCanhBaoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThongTinLuatCanhBaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
