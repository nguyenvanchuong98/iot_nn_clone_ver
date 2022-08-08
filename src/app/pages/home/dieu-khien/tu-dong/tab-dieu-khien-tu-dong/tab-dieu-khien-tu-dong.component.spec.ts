import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TabDieuKhienTuDongComponent } from './tab-dieu-khien-tu-dong.component';

describe('TabDieuKhienTuDongComponent', () => {
  let component: TabDieuKhienTuDongComponent;
  let fixture: ComponentFixture<TabDieuKhienTuDongComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TabDieuKhienTuDongComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TabDieuKhienTuDongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
