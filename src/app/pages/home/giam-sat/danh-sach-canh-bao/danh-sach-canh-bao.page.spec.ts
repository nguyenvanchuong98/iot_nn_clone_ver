import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DanhSachCanhBaoPage } from './danh-sach-canh-bao.page';

describe('DanhSachCanhBaoPage', () => {
  let component: DanhSachCanhBaoPage;
  let fixture: ComponentFixture<DanhSachCanhBaoPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DanhSachCanhBaoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DanhSachCanhBaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
