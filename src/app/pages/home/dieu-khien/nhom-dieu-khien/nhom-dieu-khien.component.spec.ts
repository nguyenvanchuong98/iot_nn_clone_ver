import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NhomDieuKhienComponent } from './nhom-dieu-khien.component';

describe('NhomDieuKhienComponent', () => {
  let component: NhomDieuKhienComponent;
  let fixture: ComponentFixture<NhomDieuKhienComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NhomDieuKhienComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NhomDieuKhienComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
