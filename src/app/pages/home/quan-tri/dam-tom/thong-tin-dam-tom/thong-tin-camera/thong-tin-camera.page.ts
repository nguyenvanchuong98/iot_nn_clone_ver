import { resolveSanitizationFn } from '@angular/compiler/src/render3/view/template';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonContent,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { QuantridamtomService } from 'src/app/core/services/quantridamtom.service';
import {
  CameraConfigAttribute,
  CameraResponse,
  CamerasType,
} from 'src/app/shared/models/damtom.model';
import { escapedHTML } from 'src/app/shared/utils';

@Component({
  selector: 'app-thong-tin-camera',
  templateUrl: './thong-tin-camera.page.html',
  styleUrls: ['./thong-tin-camera.page.scss'],
})
export class ThongTinCameraPage implements OnInit {
  @ViewChild (IonContent, {static: true}) content: IonContent;

  @Input() idCam: string;
  @Input() idDamtom: string;
  statusExistCode = false;
  statusExistName = false;
  statusExistUrl = false;
  lstCamera: CamerasType[] = []; // Danh sach camera cua damtom hien tai de check trung
  formEditCamera: FormGroup;
  cameraDetail: CamerasType;
  isGoTop = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private alertCtl: AlertController,
    private damtomService: QuantridamtomService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    // this.route.params.subscribe((params) => {
    //   this.idCam = params["cameraId"];
    // });
    // this.route.params.subscribe((params) => {
    //   this.idDamtom = params["id"];
    // });
    this.damtomService
      .getListCam(this.idDamtom)
      .toPromise()
      .then((res) => {
        this.lstCamera = res;
      })
      .catch((err) => console.log('error--------------------', err));
    // Khai baos form
    this.formEditCamera = this.fb.group({
      macamera: ['', [Validators.required, Validators.pattern('^[^\\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$')]],
      tencamera: ['', Validators.required],
      // diachiip: ['', Validators.required],
      ghichu: ['', Validators.maxLength(4000)],
      ismain: false,
      rtspUrl: ['', Validators.required],
      recordHistory: false
    });
    this.getDetailCam();
  }
  // lấy chi tiết camera
  getDetailCam() {
    this.damtomService.getCambyId(this.idCam).subscribe((res: CamerasType) => {
      this.cameraDetail = res;
      this.formEditCamera.setValue({
        macamera: res.code,
        tencamera: res.name,
        // diachiip: res.url,
        ghichu: res.note,
        ismain: res.main,
        rtspUrl: res.rtspUrl,
        recordHistory: res.recordHistory
      });
    });
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
  // Cac ham check code, ten, diachiip
  // checkCodeCamera() {
  //   if ((
  //     this.lstCamera.find(
  //       (e) => e.code.toLowerCase() === this.formEditCamera.value.macamera?.trim().toLowerCase()
  //     ) != undefined)&&(this.formEditCamera.value.macamera.trim().toLowerCase()!==this.cameraDetail.code.toLowerCase())
  //   )
  //     this.statusExistCode = true;
  //   //trung ma
  //   else this.statusExistCode = false;
  // }
  // checkNameCamera() {
  //   if (
  //     (this.lstCamera.find(
  //       (e) => e.name.toLowerCase() === this.formEditCamera.value.tencamera?.trim().toLowerCase()
  //     ) != undefined)&&(this.formEditCamera.value.tencamera.trim().toLowerCase()!==this.cameraDetail.name.toLowerCase())
  //   )
  //     this.statusExistName = true;
  //   //trung ten
  //   else this.statusExistName = false;
  // }
  // checkUrlCamera() {
  //   if (
  //     (this.lstCamera.find(
  //       (e) => e.url === this.formEditCamera.value.diachiip?.trim()
  //     ) != undefined)&&(this.formEditCamera.value.diachiip.trim()!==this.cameraDetail.url)
  //   )
  //     this.statusExistUrl = true;
  //   //trung url
  //   else this.statusExistUrl = false;
  // }
  // Sua thong tin camera
  onEditCamera() {
    this.statusExistUrl = false;
    this.statusExistName = false;
    this.statusExistCode = false;
    const cameraEdit = new CamerasType();
    cameraEdit.id = this.idCam;
    cameraEdit.code = this.formEditCamera.value.macamera?.trim();
    cameraEdit.main = this.formEditCamera.value.ismain;
    cameraEdit.note = this.formEditCamera.value.ghichu?.trim();
    // cameraEdit.url = this.formEditCamera.value.diachiip.trim();
    cameraEdit.name = this.formEditCamera.value.tencamera?.trim();
    cameraEdit.recordHistory = this.formEditCamera.value.recordHistory;
    cameraEdit.rtspUrl = this.formEditCamera.value.rtspUrl?.trim();
    cameraEdit.damtomId = this.idDamtom;
    this.loadingCtrl.create({ message: '' }).then((loadEl) => {
        loadEl.present();
        this.damtomService.postCamera(cameraEdit).pipe(
          tap((res) => {
            if (res.errorDto !== null){
              if (res.errorDto.code === 1)
              {
                loadEl.dismiss();
                this.statusExistCode = true;
              }
              else if (res.errorDto.code === 2)
              {
                loadEl.dismiss();
                this.statusExistName = true;
              }
              else if (res.errorDto.code === 3)
              {
                loadEl.dismiss();
                this.statusExistUrl = true;
              }
            }
            else{
              this.getCameraConfigAttribute(res.cameraBoxId, res.url, res.rtspUrl);
              this.modalCtrl.dismiss();
              loadEl.dismiss();
              this.formEditCamera.reset();
              const MESAGE = 'Cập nhật thành công';
              const COLOR = 'success';
              this.showToast(MESAGE, COLOR);
            }
          }),
          finalize(() => {
            loadEl.dismiss();
          }),
          catchError(() => {
            const MESAGE = 'Cập nhật thất bại';
            const COLOR = 'danger';
            this.showToast(MESAGE, COLOR);
            return null;
          })
        ).subscribe();
      });
  }
  getCameraConfigAttribute(boxCameraId: string, streamId: string, rtspUrl: string): any {
    this.damtomService.getCameraAttributeConfig(boxCameraId, streamId, rtspUrl).pipe(
      tap(data => {
        const cameraConfigAttribute: CameraConfigAttribute = {
          stream: data.stream
        };
        this.damtomService.saveSharedAttribute(data.cameraDeviceId, cameraConfigAttribute).subscribe();
      }),
      catchError(() => {
        return of({});
      })
    ).subscribe();
  }
  // Xoa thong tin camera
  async onDelete() {
    const alert = await this.alertCtl.create({
      cssClass: 'my-alert-custom-class',
      // header: "Xác nhận!",
      message: `${escapedHTML(`Xóa Camera "${this.cameraDetail.name}" ?`)}`,
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
                this.damtomService.deleteCamera(this.idCam).subscribe(
                  () => {
                    loadEl.dismiss();
                    // this.router.navigate([
                    //   "./home/quan-tri/dam-tom/thong-tin-dam-tom",
                    //   this.idDamtom,
                    // ]);
                    this.modalCtrl.dismiss();
                  },
                  () => {
                    loadEl.dismiss();
                    const MESAGE = 'Xóa thất bại';
                    const COLOR = 'danger';
                    this.showToast(MESAGE, COLOR);
                  },
                  () => {
                    const MESAGE = 'Xóa thành công';
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
  buttonBack(){
    if (this.formEditCamera.dirty){
      return new Promise<boolean>(async (resolve) => {
        const alert = await this.alertCtl.create({
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
  changeUrl(){
    this.statusExistUrl = false;
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
