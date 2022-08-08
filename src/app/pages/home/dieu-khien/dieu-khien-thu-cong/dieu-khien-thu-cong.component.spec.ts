import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DieuKhienThuCongComponent } from './dieu-khien-thu-cong.component';

describe('DieuKhienThuCongComponent', () => {
  let component: DieuKhienThuCongComponent;
  let fixture: ComponentFixture<DieuKhienThuCongComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DieuKhienThuCongComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DieuKhienThuCongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
