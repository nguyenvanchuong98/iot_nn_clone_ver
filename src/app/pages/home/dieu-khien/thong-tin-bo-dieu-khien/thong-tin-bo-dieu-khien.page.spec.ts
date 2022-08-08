import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThongTinBoDieuKhienPage } from './thong-tin-bo-dieu-khien.page';

describe('ThongTinBoDieuKhienPage', () => {
  let component: ThongTinBoDieuKhienPage;
  let fixture: ComponentFixture<ThongTinBoDieuKhienPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThongTinBoDieuKhienPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThongTinBoDieuKhienPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
