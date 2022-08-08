import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThemMoiHenGioDieuKhienPage } from './them-moi-hen-gio-dieu-khien.page';

describe('ThemMoiHenGioDieuKhienPage', () => {
  let component: ThemMoiHenGioDieuKhienPage;
  let fixture: ComponentFixture<ThemMoiHenGioDieuKhienPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemMoiHenGioDieuKhienPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemMoiHenGioDieuKhienPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
