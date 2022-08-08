import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThongTinVaiTroPage } from './thong-tin-vai-tro.page';

describe('ThongTinVaiTroPage', () => {
  let component: ThongTinVaiTroPage;
  let fixture: ComponentFixture<ThongTinVaiTroPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThongTinVaiTroPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThongTinVaiTroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
