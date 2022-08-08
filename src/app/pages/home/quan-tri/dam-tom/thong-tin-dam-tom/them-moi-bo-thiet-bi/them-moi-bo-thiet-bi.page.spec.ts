import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThemMoiBoThietBiPage } from './them-moi-bo-thiet-bi.page';

describe('ThemMoiBoThietBiPage', () => {
  let component: ThemMoiBoThietBiPage;
  let fixture: ComponentFixture<ThemMoiBoThietBiPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemMoiBoThietBiPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemMoiBoThietBiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
