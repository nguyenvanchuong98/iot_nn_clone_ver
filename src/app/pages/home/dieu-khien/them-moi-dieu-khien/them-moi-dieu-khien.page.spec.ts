import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThemMoiDieuKhienPage } from './them-moi-dieu-khien.page';

describe('ThemMoiDieuKhienPage', () => {
  let component: ThemMoiDieuKhienPage;
  let fixture: ComponentFixture<ThemMoiDieuKhienPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemMoiDieuKhienPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemMoiDieuKhienPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
