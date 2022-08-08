import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThemMoiDieuKhienTuDongPage } from './them-moi-dieu-khien-tu-dong.page';

describe('ThemMoiDieuKhienTuDongPage', () => {
  let component: ThemMoiDieuKhienTuDongPage;
  let fixture: ComponentFixture<ThemMoiDieuKhienTuDongPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemMoiDieuKhienTuDongPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemMoiDieuKhienTuDongPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
