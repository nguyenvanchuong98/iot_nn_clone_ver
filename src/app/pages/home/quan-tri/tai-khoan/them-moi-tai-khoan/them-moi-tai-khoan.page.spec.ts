import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThemMoiTaiKhoanPage } from './them-moi-tai-khoan.page';

describe('ThemMoiTaiKhoanPage', () => {
  let component: ThemMoiTaiKhoanPage;
  let fixture: ComponentFixture<ThemMoiTaiKhoanPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemMoiTaiKhoanPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemMoiTaiKhoanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
