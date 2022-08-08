import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThemMoiBoDieuKhienPage } from './them-moi-bo-dieu-khien.page';

describe('ThemMoiBoDieuKhienPage', () => {
  let component: ThemMoiBoDieuKhienPage;
  let fixture: ComponentFixture<ThemMoiBoDieuKhienPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemMoiBoDieuKhienPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemMoiBoDieuKhienPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
