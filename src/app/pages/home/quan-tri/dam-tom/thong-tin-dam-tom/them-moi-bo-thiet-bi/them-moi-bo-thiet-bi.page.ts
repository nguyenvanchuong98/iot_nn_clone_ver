import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonContent,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { QuantridamtomService } from 'src/app/core/services/quantridamtom.service';
import {
  BothietbiCreate,
  DamtomFull,
  GateType,
} from 'src/app/shared/models/damtom.model';

@Component({
  selector: 'app-them-moi-bo-thiet-bi',
  templateUrl: './them-moi-bo-thiet-bi.page.html',
  styleUrls: ['./them-moi-bo-thiet-bi.page.scss'],
})
export class ThemMoiBoThietBiPage implements OnInit {
  @ViewChild (IonContent, {static: true}) content: IonContent;
  formCreatebtb: FormGroup;
  damtomLoad: DamtomFull;
  gateWaylst: GateType[] = [];
  statusExist = false;
  @Input() idDamtom: string;
  isGoTop = false;
  constructor(
    private damtomService: QuantridamtomService,
    private route: ActivatedRoute,
    private loadingCtl: LoadingController,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    // Khởi tạo form
    this.formCreatebtb = new FormGroup({
      tenbtb: new FormControl('', Validators.required),
      ghichu: new FormControl('', Validators.maxLength(4000)),
      active: new FormControl(true),
    });
    // Lấy chi tiết đầm tôm để lấy danh sách thiết bị trong đầm tôm để check trùng tên bộ
    this.damtomService.getDamtomByIdAll(this.idDamtom).subscribe((res) => {
      this.damtomLoad = res;
      this.gateWaylst = this.damtomLoad?.gateways;
    });

    this.checktenbothietbi('tb2');
  }
  // Show Toast
  private showToast(meseage: string, colorInput: string) {
    this.toastCtrl
      .create({
        message: meseage,
        color: colorInput,
        duration: 2000,
      })
      .then((toatEL) => toatEL.present());
  }

  // Thêm bộ thiết bị
  onCreateBoTb() {
    this.statusExist = false;
    const btbInput = new BothietbiCreate();
    btbInput.active = this.formCreatebtb.value.active;
    btbInput.damtomId = this.idDamtom;
    btbInput.name = this.formCreatebtb.value.tenbtb.trim();
    btbInput.note = this.formCreatebtb.value.ghichu.trim();
    this.loadingCtl.create({ message: 'Đang lưu' }).then((loadEl) => {
      loadEl.present();
      this.damtomService.postBothietbi(btbInput).subscribe(
        (res) => {
          if (res === 1) {
            loadEl.dismiss();
            // const MESAGE = "Tên bộ thiết bị đã tồn tại !";
            // const COLOR = "danger";
            // this.showToast(MESAGE, COLOR);
            this.statusExist = true;
          } else {
            loadEl.dismiss();
            this.formCreatebtb.reset();
            // this.router.navigate([
            //   "/home/quan-tri/dam-tom/thong-tin-dam-tom",
            //   this.idDamtom,
            // ]);
            this.modalCtrl.dismiss();
            const MESAGE = 'Thêm mới thành công';
            const COLOR = 'success';
            this.showToast(MESAGE, COLOR);
          }
        },
        () => {
          loadEl.dismiss();
          const MESAGE = 'Thêm mới thất bại';
          const COLOR = 'danger';
          this.showToast(MESAGE, COLOR);
        }
      );
    });
  }
  checktenbothietbi(nameInput: string) {
    return this.gateWaylst.find((el) => el.device.name.toLowerCase() === nameInput.toLowerCase());
  }
  // checkExist() {
  //   if (
  //     this.checktenbothietbi(this.formCreatebtb.value.tenbtb?.trim()) !=
  //     undefined
  //   ) {
  //     this.statusExist = true;
  //   } else {
  //     this.statusExist = false;
  //   }
  // }
  buttonBack(){
    if (this.formCreatebtb.dirty){
      return new Promise<boolean>(async (resolve) => {
        const alert = await this.alertCtrl.create({
          header: 'Bạn chắc chắn muốn Huỷ?',
          message: 'Tất cả dữ liệu sẽ không được lưu',
          buttons: [
            {
              text: 'Huỷ bỏ',
              role: 'cancel',
              handler: () => {
                resolve(false);
              }
            }, {
              text: 'Xác nhận',
              handler: () => {
                resolve(true);
                this.modalCtrl.dismiss(null);
              }
            }
          ]
        });
        await alert.present();
      });
    }else{
      this.modalCtrl.dismiss(null);
    }
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

  // router cua tab footer
  routerGs() {
    setTimeout(() => {
      this.modalCtrl.dismiss();
    }, 0);
    this.router.navigateByUrl('/home/giam-sat');
  }
  routerDk() {
    setTimeout(() => {
      this.modalCtrl.dismiss();
    }, 0);
    this.router.navigateByUrl('/home/dieu-khien');
  }

  routerCamera() {
    setTimeout(() => {
      this.modalCtrl.dismiss();
    }, 0);
    this.router.navigateByUrl('/home/camera');
  }

  routerQuanTri() {
    setTimeout(() => {
      this.modalCtrl.dismiss();
    }, 0);
    this.router.navigateByUrl('/home/quan-tri/menu');
  }
}
