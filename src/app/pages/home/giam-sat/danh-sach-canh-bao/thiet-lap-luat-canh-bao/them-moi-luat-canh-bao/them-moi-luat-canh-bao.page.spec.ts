import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThemMoiLuatCanhBaoPage } from './them-moi-luat-canh-bao.page';

describe('ThemMoiLuatCanhBaoPage', () => {
  let component: ThemMoiLuatCanhBaoPage;
  let fixture: ComponentFixture<ThemMoiLuatCanhBaoPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemMoiLuatCanhBaoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemMoiLuatCanhBaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
