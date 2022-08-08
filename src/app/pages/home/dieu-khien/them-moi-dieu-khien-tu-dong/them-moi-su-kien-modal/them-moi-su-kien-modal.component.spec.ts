import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThemMoiSuKienModalComponent } from './them-moi-su-kien-modal.component';

describe('ThemMoiSuKienModalComponent', () => {
  let component: ThemMoiSuKienModalComponent;
  let fixture: ComponentFixture<ThemMoiSuKienModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemMoiSuKienModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemMoiSuKienModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
