import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonContent, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { DeviceEntity, QuanLyZoneService, ZoneEntityPost } from 'src/app/core/services/quan-ly-zone.service';
import { DeviceZone } from 'src/app/shared/models/dieukhien.model';
import { DeviceInfo } from '../cap-nhat-nhom/cap-nhat-nhom.component';
import { ChonThietBiComponent } from '../chon-thiet-bi/chon-thiet-bi.component';

@Component({
  selector: 'app-them-moi-nhom',
  templateUrl: './them-moi-nhom.component.html',
  styleUrls: ['./them-moi-nhom.component.scss'],
})
export class ThemMoiNhomComponent implements OnInit {
  @ViewChild (IonContent, {static: true}) content: IonContent;
  // damtomid truyen tu modalCtrl (componentProps) vao
  @Input() damTomId: string;
  @Input() listDevices: DeviceZone[] = [];
  formAddZone: FormGroup;
  gatewayId: string;
  devicesChecked: DeviceInfo[] = [];
  errorMessage = '';
  isGoTop = false;

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
    this.resetChecked();
    this.formAddZone = this.fb.group({
      tenZone: ['', [Validators.required, Validators.maxLength(255)]],
    });
  }
  async showModalChooseDevice() {
    const modal = await this.modalCtrl.create({
      component: ChonThietBiComponent,
      animated: true,
      componentProps: {
        listDevices: this.listDevices
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

  resetChecked(){
    this.listDevices.forEach (zoneAll => {
      zoneAll.deviceEntityList.forEach(dv => {
        dv.isChecked = false;
      });
    });
  }
  
  addZoneUpdate() {
    this.loadingCtrl.create({message: ''}).then(loadEl => {
      loadEl.present();
      const newZone: ZoneEntityPost = {
        damtomId: this.damTomId,
        deviceIdList: this.devicesChecked.map(device => device.id),
        name: this.formAddZone.get('tenZone').value,
      };
      this.quanLyZoneService.addZoneUpdate(newZone).subscribe(respone => {
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
        this.showToast('Thêm mới thất bại!', 'danger');
      }, () => {
        loadEl.dismiss();
        this.showToast('Thêm mới thành công', 'success');
        this.modalCtrl.dismiss( 'addNnewZone');
      });
    });
  }
  changeNameZone(){
    this.errorMessage = '';
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
  huy() {
    this.modalCtrl.dismiss(null, 'cancel');
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
