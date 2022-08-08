import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThongTinTaiKhoanPage } from './thong-tin-tai-khoan.page';

describe('ThongTinTaiKhoanPage', () => {
  let component: ThongTinTaiKhoanPage;
  let fixture: ComponentFixture<ThongTinTaiKhoanPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThongTinTaiKhoanPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThongTinTaiKhoanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
