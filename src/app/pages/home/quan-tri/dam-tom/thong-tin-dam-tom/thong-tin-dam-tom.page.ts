import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonContent,
  IonSlides,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import {
  CamerasType,
  DamtomD,
  DamtomEdit,
  DamtomFull,
} from 'src/app/shared/models/damtom.model';
import { QuantridamtomService } from 'src/app/core/services/quantridamtom.service';
import { escapedHTML } from 'src/app/shared/utils';
import { map } from 'rxjs/operators';
import { PageData } from 'src/app/shared/models/page/page-data';
import { ThemMoiBoThietBiPage } from './them-moi-bo-thiet-bi/them-moi-bo-thiet-bi.page';
import { ThemMoiQuanLyPage } from './them-moi-quan-ly/them-moi-quan-ly.page';
import { ThemMoiCameraPage } from './them-moi-camera/them-moi-camera.page';
import { ThongTinBoThietBiPage } from './thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';
import { ThongTinCameraPage } from './thong-tin-camera/thong-tin-camera.page';

@Component({
  selector: 'app-thong-tin-dam-tom',
  templateUrl: './thong-tin-dam-tom.page.html',
  styleUrls: ['./thong-tin-dam-tom.page.scss'],
})
export class ThongTinDamTomPage implements OnInit {
  @ViewChild (IonContent, {static: true}) content: IonContent;

  isDirty = false;
  isExist = false;
  idDamtom: string;
  formEditDam: FormGroup;
  damtomLoad: DamtomFull;
  damtomLoad2: DamtomFull;
  listDt: DamtomD[] = [];
  lstCamera: CamerasType[] = [];
  isGoTop = false;

  segmentList: Array<string> = ['Bộ thiết bị', 'Phân vùng'];
  selectedSegment: string;
  tabZoneElement;

  @ViewChild('slides') slides: IonSlides;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private damtomService: QuantridamtomService,
    private alertCtl: AlertController,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {
    this.selectedSegment = this.segmentList[0];
  }

  ionViewWillEnter() {
    this.getDamtom2();
    this.getDamtomDetail();
  }

  // ionViewDidLeave() {
  //   if (this.isDirty) {
  //     this.formEditDam.markAsDirty();
  //   }
  // }

  ngOnInit() {
    // Id của đầm tôm hiện tại trên url
    this.route.params.subscribe((params) => {
      this.idDamtom = params.id;
    });
    // Lấy danh sách đầm tôm để find
    this.damtomService.getListDamtom().subscribe((res: DamtomD[]) => {
      this.listDt = res;
    });
    // Khởi tạo các giá trị
    this.formEditDam = this.fb.group({
      tendamtom: ['', Validators.required],
      ghichu: ['', Validators.maxLength(4000)],
      vitri: '',
    });
  }

  // Lấy chi tiết đầm tôm để refresh
  getDamtom2() {
    this.damtomService.getDamtomByIdAll(this.idDamtom).subscribe((res) => {
      // this.staffslst = res.staffs;
      res.gateways.forEach((e) => {
        this.damtomService.getBoTbbyId(e.id).subscribe((ree) => {
          e.lengthdvice = ree.listDevices?.length;
        });
      });
      this.damtomLoad2 = res;
    });

    this.damtomService.getArrCam(this.idDamtom).subscribe((res) => {
      this.lstCamera = res.data;
    });
  }

  // Lấy chi tiết đầm tôm onInit
  getDamtomDetail() {
    this.damtomService.getDamtomByIdAll(this.idDamtom).subscribe((res) => {
      // this.staffslst = res.staffs;
      this.damtomLoad = res;
      this.formEditDam.setValue({
        tendamtom: this.damtomLoad.name,
        ghichu: this.damtomLoad.note,
        vitri: this.damtomLoad.address,
      });
      res.gateways.forEach((e) => {
        this.damtomService.getBoTbbyId(e.id).subscribe((ree) => {
          e.lengthdvice = ree.listDevices?.length;
        });
      });
    });
  }
  // navigate them moi bo thiet bi
  async onRouterBtb() {
    if (this.formEditDam.dirty) {
      this.isDirty = true;
      this.formEditDam.markAsPristine();
    }
    // this.router.navigate([
    //   "/home/quan-tri/dam-tom/thong-tin-dam-tom",
    //   this.idDamtom,
    //   "them-moi-bo-thiet-bi",
    // ]);

    const modal = await this.modalCtrl.create({
      component: ThemMoiBoThietBiPage,
      cssClass: '',
      componentProps: {
        idDamtom: this.idDamtom
      },
      swipeToClose: true
    });
    modal.onDidDismiss().then((dataReturn: any) => {
      this.getDamtom2();
      if (this.isDirty) {
        this.formEditDam.markAsDirty();
      }
    });
    await modal.present();
  }
  // Navigate nguoi quan ly
  async onRouterNguoiQl() {
    if (this.formEditDam.dirty) {
      this.isDirty = true;
      this.formEditDam.markAsPristine();
    }
    this.router.navigate([
      '/home/quan-tri/dam-tom/thong-tin-dam-tom',
      this.idDamtom,
      'them-moi-quan-ly',
    ]);
    // const modal = await this.modalCtrl.create({
    //   component: ThemMoiQuanLyPage,
    //   cssClass: '',
    //   componentProps: {
    //     'idDamtom': this.idDamtom
    //   },
    //   swipeToClose: true
    // });
    //   modal.onDidDismiss().then((dataReturn: any) => {
    //     this.getDamtom2();
    //   })
    // await modal.present();
  }
  // Navigate them camera
  async onRouterCamera() {
    if (this.formEditDam.dirty) {
      this.isDirty = true;
      this.formEditDam.markAsPristine();
    }
    // this.router.navigate([
    //   "/home/quan-tri/dam-tom/thong-tin-dam-tom",
    //   this.idDamtom,
    //   "them-moi-camera",
    // ]);
    const modal = await this.modalCtrl.create({
      component: ThemMoiCameraPage,
      cssClass: '',
      componentProps: {
        idDamtom: this.idDamtom
      },
      swipeToClose: true
    });
    modal.onDidDismiss().then((dataReturn: any) => {
        this.getDamtom2();
        if (this.isDirty) {
          this.formEditDam.markAsDirty();
        }
      });
    await modal.present();
  }
  // Navigate thong tin bo thiet bi
  async onRouterTtBtb(idInput: string) {
    if (this.formEditDam.dirty) {
      this.isDirty = true;
      this.formEditDam.markAsPristine();
    }
    // this.router.navigate([
    //   "/home/quan-tri/dam-tom/thong-tin-dam-tom",
    //   this.idDamtom,
    //   "thong-tin-bo-thiet-bi",
    //   idInput,
    // ]);
    const modal = await this.modalCtrl.create({
      component: ThongTinBoThietBiPage,
      cssClass: '',
      componentProps: {
        idDamtom: this.idDamtom,
        idBtb: idInput
      },
      swipeToClose: true
    });
    modal.onDidDismiss().then((dataReturn: any) => {
        this.getDamtom2();
        if (this.isDirty) {
          this.formEditDam.markAsDirty();
        }
      });
    await modal.present();
  }
  // Navigate thong tin camera
  async onRouterTtCamera(idInput: string) {
    if (this.formEditDam.dirty) {
      this.isDirty = true;
      this.formEditDam.markAsPristine();
    }
    // this.router.navigate([
    //   "/home/quan-tri/dam-tom/thong-tin-dam-tom",
    //   this.idDamtom,
    //   "thong-tin-camera",
    //   idInput,
    // ]);
    const modal = await this.modalCtrl.create({
      component: ThongTinCameraPage,
      cssClass: '',
      componentProps: {
        idDamtom: this.idDamtom,
        idCam: idInput
      },
      swipeToClose: true
    });
    modal.onDidDismiss().then((dataReturn: any) => {
        this.getDamtom2();
        if (this.isDirty) {
          this.formEditDam.markAsDirty();
        }
      });
    await modal.present();
  }
  // Show toast
  private showToast(meseage: string, colorInput: string) {
    this.toastCtrl
      .create({
        message: meseage,
        color: colorInput,
        duration: 2000,
      })
      .then((toatEL) => toatEL.present());
  }

  // hàm xóa đầm tôm
  onDelete() {
    this.alertCtl
      .create({
        cssClass: 'my-alert-custom-class',
        message: `${escapedHTML(`Xóa nhà vườn "${this.damtomLoad.name}"?`)}`,
        buttons: [
          {
            text: 'Quay lại',
            role: 'cancel',
            cssClass: 'secondary',
          },
          {
            text: 'Xác nhận',
            handler: () => {
              if (this.damtomLoad2?.gateways?.length > 0 && this.damtomLoad2?.cameras.length > 0){
                this.showToast('Nhà vườn đang có Bộ thiết bị và Camera, không được xóa!', 'danger');
              }
              else if (this.damtomLoad2?.gateways.length > 0) {
                const MESEAGE = 'Nhà vườn đang có Bộ thiết bị, không được xóa !';
                const COLOR = 'danger';
                this.showToast(MESEAGE, COLOR);
              } else if (this.damtomLoad2?.cameras.length > 0) {
                const MESEAGE = 'Nhà vườn đang có Camera, không được xóa !';
                const COLOR = 'danger';
                this.showToast(MESEAGE, COLOR);
              } else {
                // Nếu check thỏa mãn thì xóa
                this.loadingCtrl
                  .create({ message: 'Đang xóa' })
                  .then((loadEl) => {
                    loadEl.present();
                    // Hiển thị message xóa thành công
                    this.damtomService.deleteDamtom(this.idDamtom).subscribe(
                      () => {
                        loadEl.dismiss();
                        // Show toast
                        this.formEditDam.markAsPristine();
                        this.router.navigate(['./home/quan-tri/dam-tom']);
                      },
                      (error) => {
                        loadEl.dismiss();
                        const MESEAGE = 'Xóa thất bại, có lỗi xảy ra!';
                        const COLOR = 'danger';
                        if (error.error === 'Không thể xoá nhà vườn đang kích hoạt') {
                          this.showToast('Nhà vườn đang kích hoạt, không được xóa!', COLOR);
                        } else {
                          this.showToast(MESEAGE, COLOR);
                        }
                      },
                      () => {
                        const MESEAGE = 'Xóa thành công';
                        const COLOR = 'success';
                        this.showToast(MESEAGE, COLOR);
                      }
                    );
                  });
              }
            },
          },
        ],
      })
      .then((loadEl) => {
        loadEl.present();
      });
  }

  // Xóa camera
  async onDeleteCamera(idCam, tenCam) {
    const alert = await this.alertCtl.create({
      cssClass: 'my-alert-custom-class',
      // header: "Xác nhận!",
      message: `${escapedHTML(`Xóa Camera  "${tenCam}" ?`)}`,
      buttons: [
        {
          text: 'Quay lại',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Xác nhận',
          handler: () => {
            this.loadingCtrl
              .create({ message: 'Đang xóa' })
              .then((loadEl) => {
                loadEl.present();
                this.damtomService.deleteCamera(idCam).subscribe(
                  () => {
                    this.getDamtom2();
                    loadEl.dismiss();
                  },
                  () => {
                    loadEl.dismiss();
                    const MESAGE = 'Xóa thất bại !';
                    const COLOR = 'danger';
                    this.showToast(MESAGE, COLOR);
                  },
                  () => {
                    const MESAGE = 'Xóa thành công !';
                    const COLOR = 'success';
                    this.showToast(MESAGE, COLOR);
                  }
                );
              });
          },
        },
      ],
    });
    await alert.present();
  }

  // Check trung ten dam tom
  // checkExist() {
  //   if (this.formEditDam.value.tendamtom?.trim().toLowerCase() === this.damtomLoad.name.toLowerCase()) {
  //     this.isExist = false;
  //   } else {
  //     if (
  //       this.checkTendamtom(this.formEditDam.value.tendamtom?.trim()) !=
  //       undefined
  //     ) {
  //       this.isExist = true;
  //     } else {
  //       this.isExist = false;
  //     }
  //   }
  // }
  // Sửa đầm tôm
  onEditDam() {
    this.isExist = false;
    const EditDamtomDto = new DamtomEdit();
    EditDamtomDto.id = this.idDamtom;
    EditDamtomDto.name = this.formEditDam.value.tendamtom?.trim();
    EditDamtomDto.note = this.formEditDam.value.ghichu?.trim();
    EditDamtomDto.active = true;
    EditDamtomDto.address = this.formEditDam.value.vitri?.trim();
    const arrrdd: Array<string> = [];
    this.damtomLoad2.staffs.forEach((dt) => {
      arrrdd.push(dt.userId);
    });
    EditDamtomDto.staffs = arrrdd;
    // EditDamtomDto.staffs=this.getLstId();

    this.loadingCtrl.create({ message: 'Đang lưu' }).then((loadEl) => {
      loadEl.present();
      this.damtomService.postDamtom(EditDamtomDto).subscribe(
        (res) => {
          if (res === 2){
            loadEl.dismiss();
            // const MESEAGE = "Tên đầm tôm đã tồn tại !";
            // const COLOR = "danger";
            // this.showToast(MESEAGE, COLOR);
            this.isExist = true;
          }
          else{
            const MESEAGE = 'Cập nhật thành công';
            const COLOR = 'success';
            this.showToast(MESEAGE, COLOR);
            this.router.navigate(['/home/quan-tri/dam-tom']);
            loadEl.dismiss();
            this.formEditDam.reset();
          }
        },
        () => {
          loadEl.dismiss();
          this.router.navigate(['/home/quan-tri/dam-tom']);
          const MESEAGE = 'Cập nhật thất bại';
          const COLOR = 'danger';
          this.showToast(MESEAGE, COLOR);
          this.formEditDam.reset();
        }
      );
    });
  }
  async goToQuanLyNhom() {
    this.router.navigate(['/', 'home', 'quan-tri', 'quan-ly-nhom', this.idDamtom], {queryParams: {fromDamTom: 'true'}});
  }
  // check trùng tên đầm tôm
  checkTendamtom(tenCondi: string) {
    return this.listDt.find((el) => el.name.toLowerCase() === tenCondi.toLowerCase());
  }
  buttonBack(){
    this.router.navigateByUrl('/home/quan-tri/dam-tom');
  }
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

  // event of segment and slider
  segmentChanged(item: string, index: number){
    this.slides.slideTo(index);
    // this.tabZoneElement = document.getElementById('gridZone');
    // if (index === 1) {
    //   this.tabZoneElement.classList.add('active-tab');
    // } else if(index === 0) {
    //   this.tabZoneElement.classList.remove('active-tab');
    // }
  }
  slideChanged(event: any){
    this.slides.getActiveIndex().then(index => {
      this.selectedSegment = this.segmentList[index];
    });
  }

}
