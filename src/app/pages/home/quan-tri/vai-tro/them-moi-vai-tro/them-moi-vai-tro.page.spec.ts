import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThemMoiVaiTroPage } from './them-moi-vai-tro.page';

describe('ThemMoiVaiTroPage', () => {
  let component: ThemMoiVaiTroPage;
  let fixture: ComponentFixture<ThemMoiVaiTroPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemMoiVaiTroPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemMoiVaiTroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
