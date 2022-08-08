import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InfoDeviceSpecialComponent } from './info-device-special.component';

describe('InfoDeviceSpecialComponent', () => {
  let component: InfoDeviceSpecialComponent;
  let fixture: ComponentFixture<InfoDeviceSpecialComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoDeviceSpecialComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InfoDeviceSpecialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
