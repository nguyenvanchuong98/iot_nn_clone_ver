import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TabLichSuDieuKhienComponent } from './tab-lich-su-dieu-khien.component';

describe('TabLichSuDieuKhienComponent', () => {
  let component: TabLichSuDieuKhienComponent;
  let fixture: ComponentFixture<TabLichSuDieuKhienComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TabLichSuDieuKhienComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TabLichSuDieuKhienComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
