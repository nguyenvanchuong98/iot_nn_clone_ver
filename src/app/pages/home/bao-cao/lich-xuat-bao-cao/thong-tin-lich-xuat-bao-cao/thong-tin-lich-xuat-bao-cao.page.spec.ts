import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThongTinLichXuatBaoCaoPage } from './thong-tin-lich-xuat-bao-cao.page';

describe('ThongTinLichXuatBaoCaoPage', () => {
  let component: ThongTinLichXuatBaoCaoPage;
  let fixture: ComponentFixture<ThongTinLichXuatBaoCaoPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThongTinLichXuatBaoCaoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThongTinLichXuatBaoCaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
