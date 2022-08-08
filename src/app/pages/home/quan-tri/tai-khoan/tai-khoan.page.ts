import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonInfiniteScroll } from '@ionic/angular';
import { catchError, finalize, map } from 'rxjs/operators';
import { UsersDftService } from 'src/app/core/services/users-dft.service';
import { PageData } from 'src/app/shared/models/page/page-data';
import { PageLink } from 'src/app/shared/models/page/page-link';
import { Direction } from 'src/app/shared/models/page/sort-order';
import { Role } from 'src/app/shared/models/role.model';
import {AdditionalInfo, UsersDft} from 'src/app/shared/models/users-dft.model';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup} from '@angular/forms';
import { UploadService } from 'src/app/core/http/upload.service';
import { AuthUser } from 'src/app/shared/models/user.model';
import { getCurrentAuthUser } from 'src/app/core/auth/auth.selectors';
import { AppState } from 'src/app/core/core.state';
import { Store } from '@ngrx/store';

interface UsersDfts extends UsersDft {
  roleName?: string;
}

@Component({
  selector: 'app-tai-khoan',
  templateUrl: './tai-khoan.page.html',
  styleUrls: ['./tai-khoan.page.scss'],
})
export class TaiKhoanPage implements OnInit {

  // Event của infinite scroll để kiểm soát trạng thái load
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  // message
  message = 'Không có dữ liệu';
  pageLink: PageLink;


  isLoading = false;
  constructor(private userDftService: UsersDftService,
              private router: Router,
              private usersDftService: UsersDftService,
              private uploadService: UploadService,
              protected store: Store<AppState> ) {
  }

  // Danh Sách tài khoản sắp xếp theo
  sortOrder;
  isGoTop = false;
  // Danh sách tài khoản
  usersList: UsersDfts[] = [];
  authUser: AuthUser;
  txtSearch = '';
  @ViewChild(IonContent) gotoTop: IonContent;
  ngOnInit() {
    this.isLoading = true;
    this.authUser = getCurrentAuthUser(this.store);
  }

  // Load lại data khi vào màn hình danh sách tài khoản
  ionViewWillEnter() {
    this.isLoading = true;
    this.usersList = [];
    if (this.infiniteScroll !== null && this.infiniteScroll !== null){
      this.infiniteScroll.disabled = false;
    }
    this.sortOrder = {
      property: 'firstName',
      direction: Direction.ASC
    },
      this.pageLink = new PageLink(10, 0, '', this.sortOrder);
    this.initData();
  }
  ionViewWillLeave() {
    this.txtSearch = '';
  }
  // Load data
  fetchData(event?) {
    this.userDftService
      .getAllUsersDft(this.pageLink).pipe(
        map(
          (pageData: PageData<UsersDfts>) => {
            if (pageData !== null) {

              if (pageData.data.length > 0) {
                pageData.data.forEach(value => {
                  // Set name khi name null or undefined
                  if (value.name === null || value.name === undefined) {
                    value.name = '';
                  }

                  // Lấy các vai trò của user
                  value.roleEntity.forEach(r => {
                    if (r !== null && r !== undefined) {
                      if (value.name === '') {
                        value.name = value.name.concat(r.name);
                      }
                      else {
                        value.name = value.name.concat(',' + r.name);
                      }
                    }
                  });
                  this.uploadService.getAvatar(value.userId).subscribe(resData => {
                    if (!!resData){
                      this.uploadService.getImageDownload(value.userId, resData)
                      .subscribe((res: Blob) => {
                        const reader = new FileReader();
                        reader.addEventListener('load', () => {
                            value.urlAvatar = reader.result;
                        }, false);
                        if (res) {
                          const avatarUrl = reader.readAsDataURL(res);
                        }
                      }, () => {
                          value.urlAvatar = 'assets/images/avatar-default.png';
                      }, () => {
                          // console.log('GET observable is now completed');
                      });
                    } else{
                      value.urlAvatar = 'assets/images/avatar-default.png';
                    }
                  });
                });

                this.usersList = this.usersList.concat(pageData.data);

                // event != undefined và là event khi kéo infinite
                if (event !== undefined) {
                  if (event.type === 'ionInfinite') {
                    event.target.complete();
                  }
                }
                // Check Page has next
                if (pageData.hasNext === false) {
                  this.infiniteScroll.disabled = true;
                }
              }
              else {
                this.infiniteScroll.disabled = true;
              }
            }
            this.isLoading = false;
          }),
          finalize(() => {
            this.isLoading = false;
          }),
          catchError((error) => {
           this.message = 'Có lỗi xảy ra!';
           console.log(error);

           this.usersList.length = 0;
           return null;
          }))
      .subscribe();
  }
  initData() {
    this.fetchData();
  }
  // Load thêm data khi kéo xuống dưới
  loadMore(e) {
    this.pageLink.page++;
    this.fetchData(e);
  }
  // Load item khi tìm kiếm
  findItems(e) {
    // Enabled lại infinite scroll
    this.infiniteScroll.disabled = false;
    // set lại trang bắt đầu = 0;
    this.pageLink.page = 0;
    if (this.txtSearch && this.txtSearch.trim() !== '') {
      this.usersList = [];
      this.pageLink.textSearch = this.txtSearch;
      this.fetchData();
    }
    else {
      this.usersList = [];
      this.pageLink.textSearch = '';
      this.fetchData();
    }
  }

  // doRefresh(event) {
  //   setTimeout(() => {
  //    this.ionViewWillEnter();
  //    event.target.complete();
  //   }, 1000);
  // }
  // buttonBack(){
  //   this.router.navigate(['/home/quan-tri']);
  // }
  themMoiTk(){
    this.router.navigate(['/home/quan-tri/tai-khoan/them-moi-tai-khoan']);
  }

  activateTaiKhoan(event, user: UsersDft){
    this.usersDftService.activeUser(user.userId, event.detail.checked).subscribe();
  }
  getRoleUser(user: UsersDft){
    let roles = '';
    user.roleEntity.forEach( (value, index) => {
      roles += value.name;
      if (index < user.roleEntity.length - 1){
        roles += ', ';
      }
    });
    return roles;
  }
  goTop(){
    this.gotoTop.scrollToTop(0);
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
