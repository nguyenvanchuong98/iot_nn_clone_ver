import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { IonContent, IonInfiniteScroll } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { $ } from 'protractor';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { getCurrentAuthUser } from 'src/app/core/auth/auth.selectors';
import { AppState } from 'src/app/core/core.state';
import { QuantridamtomService } from 'src/app/core/services/quantridamtom.service';
import { DamtomD, DamtomEdit, DamtomFull } from 'src/app/shared/models/damtom.model';
import { AuthUser } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-dam-tom',
  templateUrl: './dam-tom.page.html',
  styleUrls: ['./dam-tom.page.scss'],
})
export class DamTomPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild (IonContent, {static: true}) content: IonContent;

  listdt: DamtomD[];
  lstDamtomConst: DamtomD[];
  spinStatus = 1;
  isnotFind = false;
  authUser: AuthUser;
  isAuthEdit = true;
  closed$ = new Subject<any>();
  isGoTop = false;

  constructor(private damtomService: QuantridamtomService, private router: Router, protected store: Store<AppState>) {}

  ionViewWillEnter() {
    this.getAllDt();
  }
  ngOnInit() {
    this.router.events.pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntil(this.closed$)
    ).subscribe(event => {
        if (event['urlAfterRedirects'].indexOf('/home/quan-tri/dam-tom') >= 0) {
            this.authUser = getCurrentAuthUser(this.store);
            if (this.authUser.scopes.find(el => el === 'TENANT_ADMIN') !== undefined)
            {
              this.isAuthEdit = false;
            }
            else if (this.authUser.scopes.find(el => el === 'PAGES.DAMTOM.EDIT') !== undefined)
            {
              this.isAuthEdit = false;
            }
        }
    });
  }

  getAllDt() {
    this.damtomService.getListDamtom().subscribe(
      (res: DamtomD[]) => {
        if (res.length > 0) {
          this.spinStatus = 2; // Trả về danh sách đầm tôm
          this.listdt = res;
          this.lstDamtomConst = res;
        } else {
          this.spinStatus = 3; // Không có đầm tôm nào
        }
      },
      () => {
        this.spinStatus = 4; // Lỗi không có quyền truy cập
      }
    );
  }

  async onActiveDam(event, damtomID: string){
    const DAMTOMDTO = new DamtomEdit();
    DAMTOMDTO.id = damtomID;
    await this.damtomService.getDamtomByIdAll(damtomID).toPromise().then(res => {
      DAMTOMDTO.name = res.name;
      DAMTOMDTO.note = res.note;
      DAMTOMDTO.active = res.active;
      DAMTOMDTO.address = res.address;
      const arrrdd: Array<string> = [];
      res.staffs.forEach((dt) => {
      arrrdd.push(dt.userId);
      });
      DAMTOMDTO.staffs = arrrdd;
    });
    DAMTOMDTO.active = event.detail.checked;
    this.damtomService.postDamtom(DAMTOMDTO).subscribe(res => {
    });
  }

  findDamTom(event){
    const val = event.target.value?.trim();
    if (val && val.trim() !== '') {
      this.listdt = this.lstDamtomConst.filter(
        (item) => item.name.toLowerCase().indexOf(val.toLowerCase()) > -1
      );
      if (this.listdt.length < 1) {
        this.isnotFind = true;
      } else {
        this.isnotFind = false;
      }
    } else {
      this.isnotFind = false;
      this.listdt = this.lstDamtomConst;
    }
  }

  buttonBack(){
    this.router.navigate(['/home/quan-tri/menu']);
  }

  // btn scroll top
  goTop(){
    this.content.scrollToTop(0);
  }
  logScrolling(event){
    if (event.detail.scrollTop === 0){
      this.isGoTop = false;
    }
    else {
      this.isGoTop = true;
    }
  }

}
