import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DuLieuCamBienPage } from './du-lieu-cam-bien.page';

describe('DuLieuCamBienPage', () => {
  let component: DuLieuCamBienPage;
  let fixture: ComponentFixture<DuLieuCamBienPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DuLieuCamBienPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DuLieuCamBienPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
