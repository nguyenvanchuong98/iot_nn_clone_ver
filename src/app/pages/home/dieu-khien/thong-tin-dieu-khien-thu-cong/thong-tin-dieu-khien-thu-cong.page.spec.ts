import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThongTinDieuKhienThuCongPage } from './thong-tin-dieu-khien-thu-cong.page';

describe('ThongTinDieuKhienThuCongPage', () => {
  let component: ThongTinDieuKhienThuCongPage;
  let fixture: ComponentFixture<ThongTinDieuKhienThuCongPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThongTinDieuKhienThuCongPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThongTinDieuKhienThuCongPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
