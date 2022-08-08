import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonInfiniteScroll,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { catchError, finalize, map } from 'rxjs/operators';
import { QuantridamtomService } from 'src/app/core/services/quantridamtom.service';
import {
  DamtomEdit,
  DamtomFull,
  StaffsType,
} from 'src/app/shared/models/damtom.model';
import { PageData } from 'src/app/shared/models/page/page-data';
import { PageLink } from 'src/app/shared/models/page/page-link';
import { Direction } from 'src/app/shared/models/page/sort-order';
import { UsersDft } from 'src/app/shared/models/users-dft.model';

@Component({
  selector: 'app-them-moi-quan-ly',
  templateUrl: './them-moi-quan-ly.page.html',
  styleUrls: ['./them-moi-quan-ly.page.scss'],
})
export class ThemMoiQuanLyPage implements OnInit {
  @ViewChild (IonContent, {static: true}) content: IonContent;
  isGoTop = false;

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  userList: StaffsType[] = [];
  items: StaffsType[];
  notFind = 'Không có dữ liệu';
  isnotFind = false;
  damtomLoad: DamtomFull;
  selectedArray: StaffsType[] = [];
  conStaff: StaffsType[] = [];
  idDamtom: string;
  // @Input() idDamtom: string;
  sortOrder = {
    property: 'firstName',
    direction: Direction.ASC,
  };
  pageLink: PageLink = new PageLink(1000, 0, '', this.sortOrder);
  isLoading = false;

  constructor(
    private damtomService: QuantridamtomService,
    private loadingCtl: LoadingController,
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.route.params.subscribe((params) => {
      // tslint:disable-next-line: no-string-literal
      this.idDamtom = params['id'];
    });
    this.getDamtomDetail();
    this.initializeItems();
  }
  // Thiết lập giá trị cho list checkbook
  initializeItems(event?) {
    this.damtomService
      .getListUser(this.pageLink)
      .pipe(
        map((pageData: PageData<UsersDft>) => {
          if (pageData !== null) {
            if (pageData.data.length > 0) {
              pageData.data.forEach((el) => {
                if (this.conStaff.length === 0) {
                  this.userList.push({
                    firstName: el.firstName,
                    userId: el.userId,
                    userName: el.username,
                    email: el.email,
                    phone: el.phone,
                    authority: el.authority,
                    active: el.active,
                    isChecked: false
                  });
                } else {
                  if (this.findcheck(el.userId) !== undefined) {
                    this.userList.push({
                      firstName: el.firstName,
                      userId: el.userId,
                      userName: el.username,
                      email: el.email,
                      phone: el.phone,
                      authority: el.authority,
                      active: el.active,
                      isChecked: true
                    });
                  } else {
                    this.userList.push({
                      firstName: el.firstName,
                      userId: el.userId,
                      userName: el.username,
                      email: el.email,
                      phone: el.phone,
                      authority: el.authority,
                      active: el.active,
                      isChecked: false
                    });
                  }
                }
              });
              this.items = this.userList;
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
          }
          this.isLoading = false;
        }),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError((error) => {
          console.log(error);
          this.userList.length = 0;
          return null;
        })
      )
      .subscribe();
  }

  loadData(event) {
    this.pageLink.page++;
    this.initializeItems(event);
  }

  // Tìm kiếm user
  getItems(ev: any) {
    this.selectedArray = [];
    const val = ev.target.value.trim();
    if (val && val.trim() !== '') {
      this.items = this.userList;
      this.items = this.items.filter(
        (item) => item.firstName.toLowerCase().indexOf(val.toLowerCase()) > -1
      );
      if (this.items.length < 1) {
        this.isnotFind = true;
      } else {
        this.isnotFind = false;
      }
    } else {
      this.isnotFind = false;
      this.items = this.userList;
    }
  }

  // Lấy thông tin đầm tôm và danh sách người quản lý của đầm tôm hiện tại
  getDamtomDetail() {
    this.damtomService.getDamtomByIdAll(this.idDamtom).subscribe((res: any) => {
      this.damtomLoad = res;
      this.conStaff = this.damtomLoad.staffs;
    });
  }
  // Show Toast
  private showToast(meseage: string, color: string) {
    this.toastCtrl
      .create({
        message: meseage,
        color,
        duration: 2000,
      })
      .then((toatEL) => toatEL.present());
  }

  // Chỉnh sửa người quản lý
  onCreateUser() {
    const EDIT_DAMTOMDTO = new DamtomEdit();
    // giữ nguyên các trường còn lại chỉ thay đổi staffs
    EDIT_DAMTOMDTO.id = this.idDamtom;
    EDIT_DAMTOMDTO.name = this.damtomLoad.name;
    EDIT_DAMTOMDTO.active = this.damtomLoad.active;
    EDIT_DAMTOMDTO.address = this.damtomLoad.address;
    EDIT_DAMTOMDTO.note = this.damtomLoad.note;
    const usrernameArr: Array<string> = [];
    this.selectedArray.forEach((damt) => {
      usrernameArr.push(damt.userId);
    });
    EDIT_DAMTOMDTO.staffs = usrernameArr;
    this.loadingCtl.create({ message: '' }).then((loadEl) => {
      loadEl.present();
      this.damtomService.postDamtom(EDIT_DAMTOMDTO).subscribe(
        () => {
          loadEl.dismiss();
          this.router.navigate([
            './home/quan-tri/dam-tom/thong-tin-dam-tom',
            this.idDamtom,
          ]);
          // this.modalCtrl.dismiss();
        },
        () => {
          loadEl.dismiss();
          // this.router.navigate([
          //   "./home/quan-tri/dam-tom/thong-tin-dam-tom",
          //   this.idDamtom,
          // ]);
          const MESSAGE = 'Thay đổi người quản lý thất bại';
          const COLOR = 'danger';
          this.showToast(MESSAGE, COLOR);
        },
        () => {
          const MESSAGE = 'Thay đổi người quản lý thành công';
          const COLOR = 'success';
          this.showToast(MESSAGE, COLOR);
        }
      );
    });
  }

  findcheck(idin: string) {
    return this.damtomLoad.staffs.find((elem) => elem.userId === idin);
  }
  // Lấy tất cả các object có checked=true
  selectMember(data: StaffsType) {
    console.log('chagne membar--------------------', this.selectedArray);
    
    if (data.isChecked === true) {
      this.selectedArray.push(data);
    } else {
      const index = this.removeCheckedFromArray(data);
      this.selectedArray.splice(index, 1);
    }
  }
  // Lấy vị trí phần tử có ischecked=false
  removeCheckedFromArray(inputda: StaffsType) {
    return this.selectedArray.findIndex((damt) => {
      return damt === inputda;
    });
  }
  buttonBack(){
    this.modalCtrl.dismiss();
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
