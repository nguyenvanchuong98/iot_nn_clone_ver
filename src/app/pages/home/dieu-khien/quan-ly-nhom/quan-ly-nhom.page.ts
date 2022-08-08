import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonContent, LoadingController, ModalController, ToastController } from '@ionic/angular';
import {
  DeviceEntity,
  QuanLyZoneService,
  ZoneEntityPost,
  ZoneEntityResponse, ZonesIndex,
} from '../../../../core/services/quan-ly-zone.service';
import { escapedHTML } from 'src/app/shared/utils';
import { CapNhatNhomComponent } from '../../dieu-khien/cap-nhat-nhom/cap-nhat-nhom.component';
import { ThemMoiNhomComponent } from '../../dieu-khien/them-moi-nhom/them-moi-nhom.component';
import { Subscription } from 'rxjs';
import { DeviceEntityList, DeviceZone } from 'src/app/shared/models/dieukhien.model';
import { DeviceService } from 'src/app/core/services/device-service';

@Component({
  selector: 'app-quan-ly-nhom',
  templateUrl: './quan-ly-nhom.page.html',
  styleUrls: ['./quan-ly-nhom.page.scss'],
})
export class QuanLyNhomPage implements OnInit {
  @ViewChild (IonContent, {static: true}) content: IonContent;
  isGoTop = false;
  damTomId: string;
  items;
  gatewayId: string;
  lstSensorRpc: DeviceEntity[] = [];
  listDevices: DeviceZone[] = [];
  deviceArray: DeviceEntityList[] = [];
  isFromDamtom: string;
  messageWarning = '';
  indexZone: string[] = [];
  newlistZone: ZoneEntityResponse[] = [];

  listZoneLoaded: ZoneEntityPost[];
  private zoneSubscription: Subscription;
  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private quanLyZoneService: QuanLyZoneService,
    private deviceService: DeviceService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.damTomId = params.damTomId;
      this.getAllZoneDevice();
    });
    this.activatedRoute.queryParams.subscribe(params => {
      this.isFromDamtom = params.fromDamTom;
    });
    this.quanLyZoneService.fetchListZone(this.damTomId).subscribe();

    this.zoneSubscription = this.quanLyZoneService.listZone.subscribe(listZone => {
      this.listZoneLoaded = listZone;
    });
  }
  ionViewWillEnter() {
  }

  reorderItems(event) {
    const itemMove = this.listZoneLoaded.splice(event.detail.from, 1)[0];
    this.listZoneLoaded.splice(event.detail.to, 0, itemMove);

    // mang chua zone index sort theo user
    const newOrder: string[] = [];
    this.listZoneLoaded.forEach(zone => {
      newOrder.push(zone.id);
    });
    const reorderZone: ZonesIndex = {
      zoneIds: newOrder
    };
    // post lai len server
    this.quanLyZoneService.reorderZone(this.damTomId, reorderZone).subscribe(res => {
    }, err => {
      if (err.status === 400){
      }
    });
    event.detail.complete();
  }

  buttonBack() {
    if (this.isFromDamtom === 'true'){
      this.router.navigate(['/', 'home', 'quan-tri', 'dam-tom', 'thong-tin-dam-tom', this.damTomId] );
    }else{
      this.router.navigate(['/home/dieu-khien'], {
        queryParams: { damTomId: this.damTomId },
      });
    }

  }
  async openThemMoi() {
    this.listDevices.forEach(zone => {
      zone.deviceEntityList.forEach(dv => {
        dv.isChecked = false;
      });
    });

    const modal = await this.modalCtrl.create({
      component: ThemMoiNhomComponent,
      animated: true,
      componentProps: {
        damTomId: this.damTomId,
        listDevices: this.listDevices
      },
    });

    await modal.present();
    modal.onWillDismiss().then(() => {
      this.getAllZoneDevice();
    });
    // let { data } = await modal.onWillDismiss();
    // if (data === "addNnewZone") {
    //   this.getAllZoneInDamTom();
    // }
  }
  async openCapnhap(zoneIdInput: string) {
    const modal = await this.modalCtrl
      .create({
        component: CapNhatNhomComponent,
        animated: true,
        componentProps: {
          damTomId: this.damTomId,
          listDevices: this.listDevices,
          zoneId: zoneIdInput
        }
      });
    await modal.present();
    modal.onWillDismiss().then(() => {
      this.getAllZoneDevice();
    });
  }

  // ham delete moi
  deleteZone(zoneId: string, zoneName: string){
    this.alertCtrl
    .create({
      cssClass: 'my-alert-custom-class',
      message: `${escapedHTML(`Xóa nhóm "${zoneName}"?`)}`,
      buttons: [
        {
          text: 'Quay lại',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Xác nhận',
          handler: () => {
            this.loadingCtrl.create({message: ''}).then(loadEl => {
              loadEl.present();
              this.quanLyZoneService.deleteZoneUpdate(zoneId).subscribe(() => {
                loadEl.dismiss();
                this.getAllZoneDevice();
                this.showToast('Xóa thành công', 'success');
              },
              (err) => {
                console.log('errr', err);
                loadEl.dismiss();
                if (err.error === 'Phân vùng có thiết bị không được xóa'){
                  this.showToast('Phân vùng có thiết bị. Không được xoá!', 'danger');
                }
                else{
                  this.showToast('Xóa thất bại!', 'danger');
                }
              });
            });
          },
        },
      ],
    })
    .then((loadEl) => {
      loadEl.present();
    });
  }
  // Lay danh sach tat ca device de truyen vao modal con
  getAllZoneDevice(){
    this.deviceArray = [];
    this.deviceService.getDeviceWithZone(this.damTomId).subscribe((res) => {
      this.listDevices = res;
      res.forEach(e => {
        this.deviceArray = this.deviceArray.concat(e.deviceEntityList);
      });
      const unknowDevice: DeviceZone = {
        name: 'Không có phân vùng',
        deviceEntityList: []
      };
      this.deviceService.getAllDeviceNV(this.damTomId).subscribe(data => {
        this.lstSensorRpc = data;
        this.lstSensorRpc.forEach(dv => {
          if (this.deviceArray.find(da => da.id === dv.id) === undefined){
            unknowDevice.deviceEntityList.push({
              id: dv.id,
              createTime: dv.createdTime,
              type: dv.typeDevice,
              name: dv.name,
              label: dv.label,
              deviceProfileId: null,
              isChecked: false,
            });
          }
        });
        this.listDevices.push(unknowDevice);
      });
    });
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

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
    if (this.zoneSubscription) {
      this.zoneSubscription.unsubscribe();
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
}
