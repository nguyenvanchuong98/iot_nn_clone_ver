import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThongTinCaNhanPage } from './thong-tin-ca-nhan.page';

describe('ThongTinCaNhanPage', () => {
  let component: ThongTinCaNhanPage;
  let fixture: ComponentFixture<ThongTinCaNhanPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThongTinCaNhanPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThongTinCaNhanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
