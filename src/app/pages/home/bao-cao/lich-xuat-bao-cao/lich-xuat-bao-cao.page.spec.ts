import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LichXuatBaoCaoPage } from './lich-xuat-bao-cao.page';

describe('LichXuatBaoCaoPage', () => {
  let component: LichXuatBaoCaoPage;
  let fixture: ComponentFixture<LichXuatBaoCaoPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LichXuatBaoCaoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LichXuatBaoCaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
