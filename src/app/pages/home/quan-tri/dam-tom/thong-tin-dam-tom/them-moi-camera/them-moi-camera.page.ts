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
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { QuantridamtomService } from 'src/app/core/services/quantridamtom.service';
import {
  CameraConfigAttribute,
  CamerasType
} from 'src/app/shared/models/damtom.model';

@Component({
  selector: 'app-them-moi-camera',
  templateUrl: './them-moi-camera.page.html',
  styleUrls: ['./them-moi-camera.page.scss'],
})
export class ThemMoiCameraPage implements OnInit {
  @ViewChild (IonContent, {static: true}) content: IonContent;

  formcreateCamera: FormGroup;
  @Input() idDamtom: string;
  statusExistCode = false;
  statusExistName = false;
  statusExistUrl = false;
  lstCamera: CamerasType[] = []; // Danh sach camera cua damtom hien tai de check trung
  isGoTop = false;

  constructor(
    private route: ActivatedRoute,
    private loadingCtl: LoadingController,
    private damtomSerice: QuantridamtomService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtl: AlertController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    // this.route.params.subscribe((params) => {
    //   this.idDamtom = params["id"];
    // });

    this.damtomSerice
      .getListCam(this.idDamtom)
      .toPromise()
      .then((res) => {
        this.lstCamera = res;
      })
      .catch((err) => console.log('error--------------------', err));
    this.formcreateCamera = new FormGroup({
      macamera: new FormControl('', [Validators.required,  Validators.pattern('^[^\\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$')]),
      tencamera: new FormControl('', Validators.required),
      // diachiip: new FormControl('', Validators.required),
      ghichu: new FormControl('', Validators.maxLength(4000)),
      ismain: new FormControl(false),
      recordHistory: new FormControl(false),
      rtspUrl: new FormControl('', Validators.required),
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
  //   if (
  //     this.lstCamera.find(
  //       (e) => e.code.toLowerCase() === this.formcreateCamera.value.macamera?.trim().toLowerCase()
  //     ) != undefined
  //   )
  //     this.statusExistCode = true;
  //   //trung ma
  //   else this.statusExistCode = false;
  // }
  // checkNameCamera() {
  //   if (
  //     this.lstCamera.find(
  //       (e) => e.name.toLowerCase() === this.formcreateCamera.value.tencamera?.trim().toLowerCase()
  //     ) != undefined
  //   )
  //     this.statusExistName = true;
  //   //trung ten
  //   else this.statusExistName = false;
  // }
  // checkUrlCamera() {
  //   if (
  //     this.lstCamera.find(
  //       (e) => e.url === this.formcreateCamera.value.diachiip?.trim()
  //     ) != undefined
  //   )
  //     this.statusExistUrl = true;
  //   //trung url
  //   else this.statusExistUrl = false;
  // }
  // Thêm camera
  onCreateCamera() {
    this.statusExistUrl = false;
    this.statusExistName = false;
    this.statusExistCode = false;
    const CAMERA_CREATEDTO = new CamerasType();
    CAMERA_CREATEDTO.id = null;
    CAMERA_CREATEDTO.code = this.formcreateCamera.value.macamera?.trim();
    CAMERA_CREATEDTO.main = this.formcreateCamera.value.ismain;
    CAMERA_CREATEDTO.note = this.formcreateCamera.value.ghichu?.trim();
    // CAMERA_CREATEDTO.url = this.formcreateCamera.value.diachiip?.trim();
    CAMERA_CREATEDTO.name = this.formcreateCamera.value.tencamera?.trim();
    CAMERA_CREATEDTO.recordHistory = this.formcreateCamera.value.recordHistory;
    CAMERA_CREATEDTO.rtspUrl = this.formcreateCamera.value.rtspUrl?.trim();
    CAMERA_CREATEDTO.damtomId = this.idDamtom;
    this.loadingCtl.create({ message: '' }).then((loadEl) => {
      loadEl.present();
      this.damtomSerice.postCamera(CAMERA_CREATEDTO).pipe(
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
            this.formcreateCamera.reset();
            const MESAGE = 'Thêm mới thành công';
            const COLOR = 'success';
            this.showToast(MESAGE, COLOR);
          }
        }),
        finalize(() => {
          loadEl.dismiss();
        }),
        catchError(() => {
          const MESAGE = 'Thêm mới thất bại';
          const COLOR = 'danger';
          this.showToast(MESAGE, COLOR);
          return null;
        })
      ).subscribe();
    });
  }
  getCameraConfigAttribute(boxCameraId: string, streamId: string, rtspUrl: string): any {
    this.damtomSerice.getCameraAttributeConfig(boxCameraId, streamId, rtspUrl).pipe(
      tap(data => {
        const cameraConfigAttribute: CameraConfigAttribute = {
          stream: data.stream
        };
        this.damtomSerice.saveSharedAttribute(data.cameraDeviceId, cameraConfigAttribute).subscribe();
      }),
      catchError(() => {
        return of({});
      })
    ).subscribe();
  }
  buttonBack(){
    if (this.formcreateCamera.dirty){
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
