import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { KetNoiCamBienPage } from './ket-noi-cam-bien.page';

describe('KetNoiCamBienPage', () => {
  let component: KetNoiCamBienPage;
  let fixture: ComponentFixture<KetNoiCamBienPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ KetNoiCamBienPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(KetNoiCamBienPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
