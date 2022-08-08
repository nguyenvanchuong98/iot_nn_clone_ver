import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThemMoiDieuKienThietBiModalComponent } from './them-moi-dieu-kien-thiet-bi-modal.component';

describe('ThemMoiDieuKienThietBiModalComponent', () => {
  let component: ThemMoiDieuKienThietBiModalComponent;
  let fixture: ComponentFixture<ThemMoiDieuKienThietBiModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemMoiDieuKienThietBiModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemMoiDieuKienThietBiModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
