import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonContent, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DeviceEntity, QuanLyZoneService, ZoneEntityPost, ZoneEntityResponse } from 'src/app/core/services/quan-ly-zone.service';
import { ChonThietBiComponent } from 'src/app/pages/home/dieu-khien/chon-thiet-bi/chon-thiet-bi.component';
import { DeviceZone } from '../../models/dieukhien.model';
export interface DeviceInfo{
  id: string;
  name: string;
}
@Component({
  selector: 'app-cap-nhap-nhom',
  templateUrl: './cap-nhap-nhom.component.html',
  styleUrls: ['./cap-nhap-nhom.component.scss'],
})
export class CapNhapNhomComponent implements OnInit, OnDestroy {
  @ViewChild (IonContent, {static: true}) content: IonContent;
  @Input() damTomId: string;
  @Input() listDevices: DeviceZone[] = [];
  @Input() zoneId: string;
  formAddZone: FormGroup;
  gatewayId: string;
  devicesChecked: DeviceInfo[] = [];
  errorMessage = '';
  zoneDetail: ZoneEntityResponse;
  isGoTop = false;
  listZoneLoaded: ZoneEntityPost[];
  private zoneSubscription: Subscription;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private quanLyZoneService: QuanLyZoneService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router,
  ) { }

  ngOnInit() {
    this.zoneSubscription = this.quanLyZoneService.listZone.subscribe(listZone => {
      this.listZoneLoaded = listZone;
    });

    this.formAddZone = this.fb.group({
      tenZone: ['', [Validators.required, Validators.maxLength(255)]],
    });
    this.resetChecked();
    this.quanLyZoneService.getZoneById(this.zoneId).subscribe(res => {
      this.zoneDetail = res;
      this.zoneDetail.deviceEntityList.forEach(e => {
        this.devicesChecked.push({ id: e.id, name: !!e.label ? e.label : e.name });
        // update isChecked cho device
        this.listDevices.forEach (zoneAll => {
          zoneAll.deviceEntityList.forEach(dv => {
            if (dv.id === e.id) {
              dv.isChecked = true;
            }
          });
        });
      });
      this.formAddZone.get('tenZone').setValue(this.zoneDetail.name);
    });


  }
  async showModalChooseDevice() {
    const modal = await this.modalCtrl.create({
      component: ChonThietBiComponent,
      animated: true,
      componentProps: {
        listDevices: this.listDevices,
      }
    });
    await modal.present();
    const data = await modal.onWillDismiss();
    if (!!data.data?.deviceSelected && data.data?.deviceSelected.length > 0) {
      const listDeviceSelected = data.data?.deviceSelected
      .map(
        device => {
          const deviceInfo: DeviceInfo = {
            id: device.id,
            name: !!device.label ? device.label : device.name,
          };
          return deviceInfo;
        }
      );
      // console.log(listDeviceSelected);
      this.devicesChecked = listDeviceSelected;
    } else if (data.data?.deviceSelected.length === 0) {
      this.devicesChecked = [];
    }
  }
  addNewZone(){
    this.loadingCtrl.create({message: ''}).then(loadEl => {
      loadEl.present();
      const newZone: ZoneEntityPost = {
        id: this.zoneId,
        damtomId: this.damTomId,
        deviceIdList: this.devicesChecked.map(device => device.id),
        name: this.formAddZone.get('tenZone').value,
      };
      this.quanLyZoneService.addZone(newZone).subscribe(respone => {
      }, error => {
        console.log('error add new zone', error);
        this.errorMessage = error.error;
        this.showToast('Cập nhật thất bại!', 'danger');
        loadEl.dismiss();
      }, () => {
        loadEl.dismiss();
        this.showToast('Cập nhật thành công', 'success');
        this.modalCtrl.dismiss( 'UpdateZone');
      });
    });
  }
  updateZone() {
    this.loadingCtrl.create({message: ''}).then(loadEl => {
      loadEl.present();
      const newZone: ZoneEntityPost = {
        id: this.zoneId,
        damtomId: this.damTomId,
        deviceIdList: this.devicesChecked.map(device => device.id),
        name: this.formAddZone.get('tenZone').value,
      };
      this.quanLyZoneService.updateZone(newZone).subscribe(respone => {
        this.quanLyZoneService.fetchListZone(this.damTomId).subscribe();
      }, error => {
        console.log('error add new zone', error);
        if (error.status === 500){
          this.errorMessage = 'Đang có lỗi xảy ra!';
          loadEl.dismiss();
        }else{
          // ten nhom da ton tai
          this.errorMessage = error.error;
          loadEl.dismiss();
        }
        this.showToast('Cập nhật thất bại!', 'danger');
      }, () => {
        loadEl.dismiss();
        this.showToast('Cập nhật thành công', 'success');
        this.modalCtrl.dismiss( 'addNnewZone');
      });
    });
  }
  resetChecked(){
    this.listDevices.forEach (zoneAll => {
      zoneAll.deviceEntityList.forEach(dv => {
        dv.isChecked = false;
      });
    });
  }
  changeNameZone(){
    this.errorMessage = '';
  }
  // Show toast
  private showToast(meseage: string, color: string) {
    this.toastCtrl
      .create({
        message: meseage,
        color,
        duration: 2000,
      })
      .then((toatEL) => toatEL.present());
  }
  huy() {
    if (this.formAddZone.get('tenZone').dirty){
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
                this.modalCtrl.dismiss(null, 'cancel').then();
              }
            }
          ]
        });
        await alert.present();
      });
    }else {
      this.modalCtrl.dismiss(null, 'cancel').then();
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

  ngOnDestroy() {
    if (this.zoneSubscription) {
      this.zoneSubscription.unsubscribe();
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
