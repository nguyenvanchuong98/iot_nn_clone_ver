import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThongTinBoThietBiPage } from './thong-tin-bo-thiet-bi.page';

describe('ThongTinBoThietBiPage', () => {
  let component: ThongTinBoThietBiPage;
  let fixture: ComponentFixture<ThongTinBoThietBiPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThongTinBoThietBiPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThongTinBoThietBiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
