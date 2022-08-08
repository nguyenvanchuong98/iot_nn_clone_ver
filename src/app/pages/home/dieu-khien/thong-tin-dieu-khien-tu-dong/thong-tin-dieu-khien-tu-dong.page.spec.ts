import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThongTinDieuKhienTuDongPage } from './thong-tin-dieu-khien-tu-dong.page';

describe('ThongTinDieuKhienTuDongPage', () => {
  let component: ThongTinDieuKhienTuDongPage;
  let fixture: ComponentFixture<ThongTinDieuKhienTuDongPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThongTinDieuKhienTuDongPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThongTinDieuKhienTuDongPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
