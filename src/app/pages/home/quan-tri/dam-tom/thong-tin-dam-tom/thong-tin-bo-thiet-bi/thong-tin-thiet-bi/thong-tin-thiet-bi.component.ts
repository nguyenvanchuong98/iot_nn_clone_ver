import {Component, Input, OnInit} from '@angular/core';
import {AlertController, LoadingController, ModalController, ToastController} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {QuantridamtomService} from '../../../../../../../core/services/quantridamtom.service';
import {QuanLyZoneService, ZoneEntityResponse} from '../../../../../../../core/services/quan-ly-zone.service';
import {map} from 'rxjs/operators';

enum KeySpecifications {
  ADDRESS = 'Mobus Address',
  SERIAL = 'SerialNumber',
  IP = 'SlaveID'
}

export interface InfoDevice {
  id: string;
  nameDevice?: string;
  label?: string;
  zoneId?: string;
  zoneName?: string;
}

export interface EditDeviceDto{
  deviceId: string;
  deviceType: string;
  label: string;
  zoneId: string;
}

export interface SpecificationsDevice{
  serial?: string;
  ip?: string;
  mobusAddress?: any;
}

export interface InforDeviceUpdate {
  device: {
      id: string,
      name: string,
      label: string,
      type: string,
  };
  zone: {
      id: string,
      damtomId: string,
      name: string,
      createdTime: number,
  };
  deviceType: string;
  listZone: [{
      id: string,
      damtomId: string,
      name: string,
      createdTime: number,
  }];
  listDeviceType: [{
      key: string,
      value: string
  }];
}
@Component({
  selector: 'app-thong-tin-thiet-bi',
  templateUrl: './thong-tin-thiet-bi.component.html',
  styleUrls: ['./thong-tin-thiet-bi.component.scss'],
})
export class ThongTinThietBiComponent implements OnInit {

  constructor(
      private modalCtrl: ModalController,
      private alertCtrl: AlertController,
      private loadingCtrl: LoadingController,
      private toastCtrl: ToastController,
      private fb: FormBuilder,
      private damtomService: QuantridamtomService,
      private quanLyZoneService: QuanLyZoneService,
  ) {

  }
  // lay id device tu page thong-tin-bo-thiet-bi truyen qua modal
  @Input() idDevice: string;
  @Input() idDamTom: string;
  formEditDevice: FormGroup;
  listZone: ZoneEntityResponse[] = [];
  idZoneSelected;
  isNoZone = false;
  deviceDto: EditDeviceDto;
  errorMessage = '';
  specificationsDevice: SpecificationsDevice = {
    serial: 'Chưa có',
    mobusAddress: 'Chưa có',
    ip: 'Chưa có'
  };

  inforDeviceUpdate: InforDeviceUpdate;
  customActionSheetOptions: any = {
    header: 'Chọn phân vùng',
    cssClass: 'custom-action-sheet-zone',
  };

  actionSheetChooseType: any = {
    header: 'Chọn loại',
    cssClass: 'custom-action-sheet-zone',
  };

  ngOnInit() {
    this.createFormEditDevice();
    // this.getInfoDevice();
    // this.getAllZoneInDamTom();
    // lay thong so ky thuat cua device
    this.getSpecificationsDevice();

    // update thong tin device
    this.getInforDeviceUpdate();
  }

  ionViewWillEnter() {
  }

  createFormEditDevice(){
    this.formEditDevice = this.fb.group({
      nameDevice: ['', [Validators.required, Validators.maxLength(255)]],
      // activateDevice: ['']
    });
  }

  getInforDeviceUpdate() {
    this.quanLyZoneService.getDeviceType(this.idDamTom, this.idDevice)
    .subscribe (response => {
      this.inforDeviceUpdate = response;
      
      this.formEditDevice.setValue({
        nameDevice: !!this.inforDeviceUpdate.device.label ? this.inforDeviceUpdate.device.label
                    : this.inforDeviceUpdate.device.name
      });
      this.idZoneSelected = this.inforDeviceUpdate.zone?.id;
    });
  }
  changeTypeDevice(keyType) {
    this.formEditDevice.markAsDirty();
    if (!!keyType) {
      this.inforDeviceUpdate.deviceType = keyType;
    }
  }
  changeZone(idZone) {
    this.formEditDevice.markAsDirty();
    this.idZoneSelected = idZone;
  }

  // luu lai thong tin thiet bi da cap nhat
  async submitInfoDevice() {
    this.deviceDto = {
      deviceId: this.idDevice,
      deviceType: this.inforDeviceUpdate.deviceType,
      label: this.formEditDevice.get('nameDevice').value,
      zoneId: !!this.idZoneSelected ? this.idZoneSelected : null,
    };


    const loadingEl = await this.loadingCtrl.create({
      message: 'Đang lưu...'
    });

    await loadingEl.present();

    this.damtomService.updateInfoDeviceV2(this.deviceDto, this.idDamTom).subscribe(res => {
      setTimeout(() => {
        loadingEl.dismiss();
        this.modalCtrl.dismiss(this.idDevice, 'idDeviceUpdate');
        this.showToastNotify('Cập nhật thành công!', 'success');
      }, 1000);
    }, err => {
      loadingEl.dismiss();
      if (err.error === 'Device name already exist') {
        this.errorMessage = 'Tên thiết bị đã tồn tại!';
      } else {
        this.errorMessage = 'Có lỗi xảy ra!';
      }
      // this.showToastNotify('Lỗi cập nhật thiết bị!','danger');
      console.log('loi cap nhat thiet bi 193', err);
    });
  }

  getInfoDevice(){
    this.damtomService.getInfoDevice(this.idDevice).subscribe(res => {

      this.formEditDevice.setValue({
        nameDevice: !! res.device.label ? res.device.label : res.device.name,
      });

      if (res.zone === null){
        this.isNoZone = true;
        return;
      }else{
        this.isNoZone = false;

        this.idZoneSelected = res.zone.id;

      }
    });
  }

  getAllZoneInDamTom() {
    this.listZone = [];
    this.quanLyZoneService.getAllZoneInDamTom(this.idDamTom).subscribe((response) => {
          if (response.length === 0){
            return;
          }else{
            response.forEach((zone) => {
              const zoneEntity: ZoneEntityResponse = {
                createdTime: zone.createdTime,
                damtomId: zone.damtomId,
                deviceEntityList: zone.deviceEntityList,
                id: zone.id,
                name: zone.name,
              };
              // zone chua duoc sap xep
              this.listZone.push(zoneEntity);
            });
            this.sortZones();
          }
        }, err => {
          console.log('get all zone in dam tom error', err);
        });
  }
  sortZones(){
    // lay index cua zone
    this.quanLyZoneService.getIndexOfZone(this.idDamTom).subscribe(res => {
      // console.log('index of zone ===== 77',res, res.zoneIds);

      this.listZone = this.listZone.map((zone) => {
        return {
          createdTime: zone.createdTime,
          damtomId: zone.damtomId,
          deviceEntityList: zone.deviceEntityList,
          id: zone.id,
          name: zone.name,
          indexZone: res.zoneIds.findIndex((zoneid) => {
            return zoneid === zone.id;
          })
        };
      });
      // sort zone theo index tu thap den cao (0-n)
      this.listZone.sort((a, b) => {
        return a.indexZone - b.indexZone;
      });
      // console.log('new zone sorted 95',this.listZone);
    }, error => {
      console.log('get index zone error 96', error);
    });
  }

  cancelInfoDevice(){
    this.modalCtrl.dismiss();
  }

  private showToastNotify(messageInfo: string, colorToast: string) {
    this.toastCtrl
        .create({
          message: messageInfo,
          duration: 2000,
          color: colorToast,
        })
        .then((toastEl) => toastEl.present());
  }
  changeDeviceName(){
    this.errorMessage = '';
  }
  async getSpecificationsDevice() {
    const dataList = await this.damtomService.getInfoDeviceOrGateway(this.idDevice, false).toPromise();

    dataList.forEach(data => {
      if (data.key === KeySpecifications.SERIAL){
        this.specificationsDevice.serial = data.valueAsString;
      }else if (data.key === KeySpecifications.ADDRESS){
        this.specificationsDevice.mobusAddress = data.valueAsString;
      }else if (data.key === KeySpecifications.IP){
        this.specificationsDevice.ip = data.valueAsString;
      }
    });
  }

  // thong so ky thuat cua device
  async infoDevice() {
    const alert = await this.alertCtrl.create({
      header: this.formEditDevice.get('nameDevice').value,
      backdropDismiss: true,
      cssClass: 'infoGateway',
      // message: `<p>Serial: ${this.specificationsDevice?.serial}</p>` +
      // `<p>IP: ${this.specificationsDevice?.ip}</p>` +
      // `<p>Cổng kết nối: ${this.specificationsDevice?.mobusAddress}</p>`,
      inputs: [
        {
          name: 'SerialNumber',
          type: 'text',
          placeholder: 'SerialNumber',
          value: this.specificationsDevice.serial,
        },
        {
          name: 'SlaveID',
          type: 'text',
          placeholder: 'SlaveID',
          value: this.specificationsDevice.ip,
        },{
          name: 'MobusAddress',
          type: 'text',
          placeholder: 'MobusAddress',
          value: this.specificationsDevice.mobusAddress,
        },
      ],
      buttons: [
        {
          text: 'Xác nhận',
          handler: (value) => {
            console.log('edit info device',value);
            const infoDevice = {
              SerialNumber: value.SerialNumber,
              SlaveID: value.SlaveID,
              MobusAddress: value.MobusAddress,
            }
            this.specificationsDevice.serial = value.SerialNumber;
            this.specificationsDevice.ip = value.SlaveID;
            this.specificationsDevice.mobusAddress = value.MobusAddress;
            
            this.damtomService.saveInforDeviceOrGw(this.idDevice, infoDevice)
            .subscribe(resData => {
              console.log('resData when update info gw', resData);
            })
          }
        }
      ]
    });
    await  alert.present();
  }
}
