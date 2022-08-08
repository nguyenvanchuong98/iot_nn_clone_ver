import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThongTinHenGioDieuKhienPage } from './thong-tin-hen-gio-dieu-khien.page';

describe('ThongTinHenGioDieuKhienPage', () => {
  let component: ThongTinHenGioDieuKhienPage;
  let fixture: ComponentFixture<ThongTinHenGioDieuKhienPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThongTinHenGioDieuKhienPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThongTinHenGioDieuKhienPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
