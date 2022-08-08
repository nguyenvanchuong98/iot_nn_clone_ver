import {Component, OnInit, ViewChild} from '@angular/core';
import {AlertController, IonContent} from '@ionic/angular';
import {AuthService} from '../../../../core/auth/auth.service';
import {AuthUser} from '../../../../shared/models/user.model';
import {filter, takeUntil} from 'rxjs/operators';
import {NavigationEnd, Router} from '@angular/router';
import {getCurrentAuthUser} from '../../../../core/auth/auth.selectors';
import {Subject} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../core/core.state';
import {UserService} from '../../../../core/http/user.service';
import {UploadService} from '../../../../core/http/upload.service';
import {LocalStorageService} from '../../../../core/local-storage/local-storage.service';
import { RoleService } from 'src/app/core/services/role.service';

@Component({
  selector: 'app-quan-tri-menu',
  templateUrl: './quan-tri-menu.page.html',
  styleUrls: ['./quan-tri-menu.page.scss'],
})
export class QuanTriMenuPage implements OnInit {
  openAccordion: boolean = false;
  authUser: AuthUser;
  nameUser: string;
  closed$ = new Subject<any>();
  avatarBlobUrl;
  fileName;
  roleName;
  isGoTop = false;
  constructor( private alertCtrl: AlertController,
               private authService: AuthService,
               private router: Router,
               protected store: Store<AppState>,
               private userService: UserService,
               private uploadService: UploadService,
               private localStorage: LocalStorageService,
               private roleService: RoleService) { }
  @ViewChild(IonContent) gotoTop: IonContent;
  ngOnInit() {
  }

  ionViewWillEnter() {
    this.authUser = getCurrentAuthUser(this.store);
    this.getUserInfor();
    this.getUserAvatar();
  }
  // getUserInfor() {
  //   this.userService.getUser(this.authUser.userId).subscribe(user => {
  //     this.nameUser = user.firstName;
  //   }, (errorRes) => {
  //     console.log('error fetching data user', errorRes);
  //   }, () => {
  //   });

  // }

  getUserInfor() {
    this.userService.getUser(this.authUser.userId).subscribe((user) => {
        this.nameUser = user.firstName;
        if (user.hasOwnProperty('authority') && user.authority === 'TENANT_ADMIN') {
            this.roleName = 'Chủ nhà vườn';
            // this.fontWeight = "700"
        }
        else {
            this.roleService.getRoleIdByUserId(user.id.id).subscribe(roles => {
                if (roles.length === 0) {
                    this.roleName = 'Không có vai trò';
                }
                else {
                    let role = '';
                    for (let i = 0; i < roles.length; i ++) {
                        role += roles[i];
                        if (i < roles.length - 1) {
                            role += ',';
                        }
                    }
                    this.roleName = role;
                }
            });
        }
    }, (errorRes) => {
      console.log('error fetching data user', errorRes);
    }, () => {
    });
  }

  getUserAvatar() {
    this.uploadService.getAvatar(this.authUser.userId).subscribe(resData => {
      this.fileName = resData;
      this.uploadService.getImageDownload(this.authUser.userId, this.fileName)
          // tslint:disable-next-line: no-shadowed-variable
          .subscribe(resData => {
            this.createImageFromBlob(resData);
          }, errorRes => {
            console.log('error when download avatar', errorRes);
          }, () => {
            // console.log('GET observable is now completed');
          });
    });
  }
  createImageFromBlob(avatar: Blob) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.avatarBlobUrl = reader.result;
      // console.log('avatarUrl: ',this.avatarBlobUrl);
    }, false);

    if (avatar) {
      const avatarUrl = reader.readAsDataURL(avatar);
    }
  }

  toggleAccordionList(){
    this.openAccordion = !this.openAccordion;
  }
  userLogout() {
    this.alertCtrl.create({
      message: 'Bạn chắc chắn muốn Đăng xuất?',
      cssClass: 'my-alert-custom-class',
      buttons: [
        {
          text: 'Huỷ bỏ',
          role: 'cancel'
        }, {
          text: 'Đăng xuất',
          handler: () => {
            this.authService.logout();
            // tslint:disable-next-line: no-unused-expression
            this.localStorage.getItem('autoLogin') === 'false';
            this.authUser = null;

            // remove data giamSatDamtoms
            // localStorage.removeItem('giamSatDamtoms');
            // remove data dieuKhienDamToms
            // localStorage.removeItem('dieuKhienDamtoms');
            // localStorage.removeItem('idDamNow');
          }
        }
      ]
    }).then(alertEl => {
      alertEl.present();
    });

  }
  doRefresh(event) {
    setTimeout(() => {
      this.authUser = getCurrentAuthUser(this.store);
      this.getUserInfor();
      this.getUserAvatar();
      event.target.complete();
    }, 1000);
  }
  goTop() {
    this.gotoTop.scrollToTop(0);
  }
  logScrolling(event) {
    if (event.detail.scrollTop === 0) {
      this.isGoTop = false;
    } else {
      this.isGoTop = true;
    }
  }
}
