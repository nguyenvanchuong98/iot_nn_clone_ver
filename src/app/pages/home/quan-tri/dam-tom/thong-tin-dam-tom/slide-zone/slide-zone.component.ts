import { Component, Input, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DeviceService } from 'src/app/core/services/device-service';
// tslint:disable-next-line: max-line-length
import { DeviceEntity, QuanLyZoneService, ZoneEntityPost, ZoneEntityResponse, ZonesIndex } from 'src/app/core/services/quan-ly-zone.service';
import { CapNhapNhomComponent } from 'src/app/shared/components/cap-nhap-nhom/cap-nhap-nhom.component';
import { ThemMoiNhomComponent } from 'src/app/shared/components/them-moi-nhom/them-moi-nhom.component';
import { DeviceEntityList, DeviceZone } from 'src/app/shared/models/dieukhien.model';
import { escapedHTML } from 'src/app/shared/utils';

@Component({
  selector: 'app-slide-zone',
  templateUrl: './slide-zone.component.html',
  styleUrls: ['./slide-zone.component.scss'],
})
export class SlideZoneComponent implements OnInit {
  @Input() damTomId: string;
  lstSensorRpc: DeviceEntity[] = [];
  listDevices: DeviceZone[] = [];
  deviceArray: DeviceEntityList[] = [];
  messageWarning = '';
  indexZone: string[] = [];
  newlistZone: ZoneEntityResponse[] = [];
  listZoneLoaded: ZoneEntityPost[];
  private zoneSubscription: Subscription;

  constructor(
    private modalCtrl: ModalController,
    private quanLyZoneService: QuanLyZoneService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private deviceService: DeviceService,
  ) { }

  ngOnInit() {
    this.getAllZoneDevice();

    this.zoneSubscription = this.quanLyZoneService.listZone.subscribe(listZone => {
      this.listZoneLoaded = listZone;
    });
  }
  // tslint:disable-next-line: use-lifecycle-interface
  ngOnChanges(){
    // update cach fetch zone
    this.quanLyZoneService.fetchListZone(this.damTomId).subscribe();

  }
  ionViewWillEnter(){
  }
  // khong dung nua
  getAllZoneInDamTom() {
    this.newlistZone = [];
    this.quanLyZoneService
      .getAllZoneInDamTom(this.damTomId)
      .subscribe((response) => {
        if (response.length === 0){
          this.messageWarning = 'Chưa có nhóm!';
          return;
        }else{
          this.messageWarning = '';
          response.forEach((zone) => {
            const zoneEntity: ZoneEntityResponse = {
              createdTime: zone.createdTime,
              damtomId: zone.damtomId,
              deviceEntityList: zone.deviceEntityList,
              id: zone.id,
              name: zone.name,
            };
            // zone chua duoc sap xep
            this.newlistZone.push(zoneEntity);
          });
          this.sortZones();
        }
      }, err => {
        console.log('get all zone in dam tom error', err);
      });
  }

  sortZones(){
    // lay index cua zone
    this.quanLyZoneService.getIndexOfZone(this.damTomId).subscribe(res => {
      this.indexZone = res.zoneIds;

      this.newlistZone = this.newlistZone.map((zone) => {
        return {
          createdTime: zone.createdTime,
          damtomId: zone.damtomId,
          deviceEntityList: zone.deviceEntityList,
          id: zone.id,
          name: zone.name,
          indexZone: this.indexZone.findIndex((zoneid) => {
            return zoneid === zone.id;
          })
        };
      });
      // sort zone theo index tu thap den cao (0-n)
      this.newlistZone.sort((a, b) => {
        return a.indexZone - b.indexZone;
      });
    }, error => {
      console.log('get index zone error 96', error);
    });
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
        console.log('zone da bi ai do xoa', err);
      }
    });
    event.detail.complete();
  }

  async openThemMoi() {
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
        component: CapNhapNhomComponent,
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
  // khong dung nua
  xoaZone(zoneIdInput: string, zoneName: string){
    this.alertCtrl
      .create({
        cssClass: 'my-alert-custom-class',
        message: `<b>${escapedHTML(`Xóa ${zoneName}`)}</b>`,
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
                this.quanLyZoneService.deleteZone(zoneIdInput).subscribe(async res => {
                  await this.getAllZoneInDamTom();
                  loadEl.dismiss();
                  this.showToast('Xóa thành công', 'success');
                },
                (err) => {
                  console.log('errr', err);
                  loadEl.dismiss();
                  if (err.error === 'Nhóm có thiết bị không được xóa'){
                    this.showToast('Nhóm đang có thiết bị, không được xóa!', 'danger');
                  }else if (err.status === 200){
                    this.showToast('Xóa thành công', 'success');
                    this.getAllZoneInDamTom();
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

  // ham delete moi
  deleteZone(zoneId: string, zoneName: string){
    this.alertCtrl
    .create({
      cssClass: 'my-alert-custom-class',
      message: `${escapedHTML(`Xóa phân vùng "${zoneName}"?`)}`,
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
        name: 'Không xác định',
        deviceEntityList: []
      };
      this.deviceService.getAllDeviceNV(this.damTomId).subscribe(data => {
        this.lstSensorRpc = data;
        this.lstSensorRpc.forEach(dv => {
          if (this.deviceArray.find(da => da.id === dv.id) === undefined){
            unknowDevice.deviceEntityList.push({
              id: dv.id,
              createTime: dv.createdTime,
              type: null,
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
}
