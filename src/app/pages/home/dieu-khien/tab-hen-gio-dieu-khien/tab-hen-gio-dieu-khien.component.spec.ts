import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TabHenGioDieuKhienComponent } from './tab-hen-gio-dieu-khien.component';

describe('TabHenGioDieuKhienComponent', () => {
  let component: TabHenGioDieuKhienComponent;
  let fixture: ComponentFixture<TabHenGioDieuKhienComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TabHenGioDieuKhienComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TabHenGioDieuKhienComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
