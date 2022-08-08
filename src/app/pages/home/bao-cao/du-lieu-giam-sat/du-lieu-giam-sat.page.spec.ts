import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DuLieuGiamSatPage } from './du-lieu-giam-sat.page';

describe('DuLieuGiamSatPage', () => {
  let component: DuLieuGiamSatPage;
  let fixture: ComponentFixture<DuLieuGiamSatPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DuLieuGiamSatPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DuLieuGiamSatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
