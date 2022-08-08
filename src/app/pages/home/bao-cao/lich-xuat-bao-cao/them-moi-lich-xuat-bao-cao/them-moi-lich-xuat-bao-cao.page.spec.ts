import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThemMoiLichXuatBaoCaoPage } from './them-moi-lich-xuat-bao-cao.page';

describe('ThemMoiLichXuatBaoCaoPage', () => {
  let component: ThemMoiLichXuatBaoCaoPage;
  let fixture: ComponentFixture<ThemMoiLichXuatBaoCaoPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemMoiLichXuatBaoCaoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemMoiLichXuatBaoCaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
