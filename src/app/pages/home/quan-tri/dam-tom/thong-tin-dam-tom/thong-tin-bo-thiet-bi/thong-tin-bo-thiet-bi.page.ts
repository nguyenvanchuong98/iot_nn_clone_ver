import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  BothietbiEdit,
  DamtomFull,
  GateType,
  GetBothietbi, Id,
  ListDevicesType,
} from 'src/app/shared/models/damtom.model';
import { escapedHTML } from 'src/app/shared/utils';
import { AddDeviceSpecialComponent } from './add-device-special/add-device-special.component';
import { InfoDeviceSpecialComponent } from './info-device-special/info-device-special.component';
import {ThongTinThietBiComponent} from './thong-tin-thiet-bi/thong-tin-thiet-bi.component';
export class ThietBiForm{
  label = '';
}

enum KeySpecificationsGw {
  ID = 'ID',
  IMEI = 'IMEI',
  IP = 'IP',
  MAC = 'MAC'
}
export interface SpecificationsGw {
  id: string;
  imei: string;
  ip: string;
  mac: string;
}
export interface RpcPullPush {
  createdTime: number;
  damTomId: string;
  deviceId: string;
  deviceType: string; // REM
  label: string;
  setValueMethod: string;
  statusDevice: number;
  statusTime: number;
  tenThietBi: string;
}
export interface SpecialDevice {
  createdTime: number;
  damtomId: string;
  deviceType: string;
  finishTime: number; // time rem rai tu 0 - 100%
  id: string;
  latestAction: string;
  latestTimeAction: number; // thoi diem cuoi cung thao tac
  name: string;
  oldStatus: number; // trang thai ban dau (%)
  pauseStatus: number; // trang thai hien tai (%)
  rpcPullDevice: RpcPullPush;
  rpcPullId: string;
  rpcPushDevice: RpcPullPush;
  rpcPushId: string;

  disable?: boolean;
}
@Component({
  selector: 'app-thong-tin-bo-thiet-bi',
  templateUrl: './thong-tin-bo-thiet-bi.page.html',
  styleUrls: ['./thong-tin-bo-thiet-bi.page.scss'],
})
export class ThongTinBoThietBiPage implements OnInit {
  @ViewChild (IonContent, {static: true}) content: IonContent;
  formEditBtb: FormGroup;
  getThisBtb: GetBothietbi;
  lstDevice: Array<ListDevicesType> = [];
  lstGateway: GateType[] = [];
  damtomLoad: DamtomFull;
  btbActive = true;
  @Input() idBtb: string;
  @Input() idDamtom: string;
  statusExist = false;
  isWantEditTenTb = false;

  specificationsGw: SpecificationsGw = {
    id: 'Chưa có',
    imei: 'Chưa có',
    ip: 'Chưa có',
    mac: 'Chưa có'
  };
  isGoTop = false;
  idGwForEditInfo: string;

  listRpcRem: any[] = [];
  listDeviceSpecial: SpecialDevice[] = [];

  constructor(
    private route: ActivatedRoute,
    private damtomService: QuantridamtomService,
    private fb: FormBuilder,
    private loadingCtl: LoadingController,
    private alertCtl: AlertController,
    private router: Router,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    // this.route.params.subscribe((params) => {
    //   this.idBtb = params["boThietBiId"];
    // });
    // this.route.params.subscribe((params) => {
    //   this.idDamtom = params["id"];
    // });
    this.getBothietbiDeatail();
    this.formEditBtb = this.fb.group({
      tenbtb: ['', Validators.required],
      ghichu: ['', Validators.maxLength(4000)],
      active: '',
      tenThietBis: this.fb.array([])
    });

    // Lấy chi tiết đầm tôm để lấy danh sách thiết bị trong đầm tôm để check trùng tên bộ
    this.damtomService.getDamtomByIdAll(this.idDamtom).subscribe((res) => {
      this.damtomLoad = res;
      this.lstGateway = this.damtomLoad?.gateways;
    });

    this.getSpecificationsGw();
    this.getRpcRem();
    this.getListDeviceSpecial();
  }

  // Thao tac voi formarray
  get tenThietBis(): FormArray {
    return this.formEditBtb.get('tenThietBis') as FormArray;
  }
  addTbi(tbiForm: ThietBiForm) {
    const fg = this.fb.group(tbiForm);
    this.tenThietBis.push(fg);
  }
  // Lấy chi tiết bộ thiết bị
  getBothietbiDeatail() {
    this.damtomService
      .getBoTbbyId(this.idBtb)
      .subscribe((res: GetBothietbi) => {
        this.btbActive = res.gateway.active;

        // luu id gw de update info gw
        this.idGwForEditInfo = res.gateway.device.id;
        console.log('ten gw', this.idGwForEditInfo);
        

        this.formEditBtb.setValue({
          tenbtb: res.gateway.device.name,
          ghichu: res.gateway.device.additionalInfo.description,
          active: res.gateway.active,
          tenThietBis: []
        });
        this.lstDevice = res.listDevices;
        
        this.lstDevice.forEach(el => {
          this.addTbi({label: el.displayName});
        });
        // Lấy thông tin của bộ thiết bị này
        this.getThisBtb = res;
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
  // check ten btb
  checktenbothietbi(nameInput: string) {
    return this.lstGateway.find((el) => el.device.name.toLowerCase() === nameInput.toLowerCase());
  }
  // Check exist
  // checkExist() {
  //   if (
  //     this.formEditBtb.value.tenbtb?.trim().toLowerCase() ===
  //     this.getThisBtb?.gateway.device.name.toLowerCase()
  //   ) {
  //     this.statusExist = false;
  //   } else {
  //     if (
  //       this.checktenbothietbi(this.formEditBtb.value.tenbtb?.trim()) !=
  //       undefined
  //     ) {
  //       this.statusExist = true;
  //     } else {
  //       this.statusExist = false;
  //     }
  //   }
  // }

  onEditBoTb() {
    this.statusExist = false;
    const btbEdit = new BothietbiEdit();
    btbEdit.id = this.idBtb;
    btbEdit.name = this.formEditBtb.value.tenbtb.trim();
    btbEdit.note = this.formEditBtb.value.ghichu.trim();
    btbEdit.active = this.formEditBtb.value.active;
    btbEdit.damtomId = this.idDamtom;

    this.loadingCtl.create({ message: 'Đang lưu...' }).then((loadEl) => {
      loadEl.present();
      this.damtomService.putBothietbi(btbEdit).subscribe(
        (res) => {
          if (res === 1) {
            loadEl.dismiss();
            // const MESAGE = "Tên bộ thiết bị đã tồn tại !";
            // const COLOR = "danger";
            // this.showToast(MESAGE, COLOR);
            this.statusExist = true;
          } else {
            loadEl.dismiss();
            // this.router.navigate([
            //   "/home/quan-tri/dam-tom/thong-tin-dam-tom",
            //   this.idDamtom,
            // ]);
            this.modalCtrl.dismiss();
            this.formEditBtb.reset();
            const MESAGE = 'Cập nhật thành công';
            const COLOR = 'success';
            this.showToast(MESAGE, COLOR);
          }
        },
        () => {
          loadEl.dismiss();
          const MESAGE = 'Cập nhật thất bại';
          const COLOR = 'danger';
          this.showToast(MESAGE, COLOR);
        }
      );
    });
  }

  // hàm xóa bộ thiết bị
  onDeleteBtb() {

    this.alertCtl
      .create({
        cssClass: 'my-alert-custom-class',
        // header: "Xác nhận!",
        message: `${escapedHTML(`Xóa Bộ thiết bị "${this.getThisBtb.gateway.device.name}" ?`)}`,
        buttons: [
          {
            text: 'Quay lại',
            role: 'cancel',
            cssClass: 'secondary',
          },
          {
            text: 'Xác nhận',
            handler: () => {
              if (this.lstDevice.length > 0) {
                const MESAGE = 'Bộ thiết bị đang có thiết bị, không được xóa!';
                const COLOR = 'danger';
                this.showToast(MESAGE, COLOR);
              } else if (this.lstDevice.length === 0) {
                if (this.btbActive) {
                  const MESAGE = 'Bộ thiết bị đang kích hoạt, không được xóa!';
                  const COLOR = 'danger';
                  this.showToast(MESAGE, COLOR);
                  return;
                }
                else{
                  this.loadingCtl
                      .create({ message: 'Đang xóa...' })
                      .then((loadEl) => {
                        loadEl.present();
                        this.damtomService.deleteBothietbi(this.idBtb, this.idDamtom).subscribe(
                            () => {
                              loadEl.dismiss();
                              // this.router.navigate([
                              //   "./home/quan-tri/dam-tom/thong-tin-dam-tom",
                              //   this.idDamtom,
                              // ]);
                              this.modalCtrl.dismiss();
                            },
                            (errorRes) => {
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
                }
              }
            },
          },
        ],
      })
      .then((loadEl) => {
        loadEl.present();
      });
  }

  doFollowDevive(event: any, idDv: string){
    this.damtomService.followDevice(event.detail.checked, idDv).subscribe();
  }

  async deleteSpecialDevice(device: SpecialDevice) {
    const loadingCtrl = await this.loadingCtl.create({
      message: 'Đang xoá...'
    });
    const alert = await this.alertCtl.create({
      message: `${escapedHTML(`Xóa thiết bị đặc biệt"${device.name}" ?`)}`,
      buttons: [
        {
          text: 'Quay lại',
          role: 'cancel'
        },
        {
          text: 'Xác nhận',
          handler: async () => {
            // xoa device -> request delete
            await loadingCtrl.present();

            this.damtomService.deleteSpecialDevice(device.id).subscribe(res => {
              console.log('res delete special device',res);
              setTimeout(() => {
                loadingCtrl.dismiss();
                this.showToastNotify('Xoá thành công!', 'success');
                this.listDeviceSpecial.splice(this.listDeviceSpecial.indexOf(device), 1);
              }, 1000);
            }, err => {
              console.log(err);
              setTimeout(() => {
                loadingCtrl.dismiss();
                this.showToastNotify('Có lỗi xảy ra!', 'danger');
              }, 1000);
            }, () => {
              setTimeout(() => {
                loadingCtrl.dismiss();
              }, 1000);
            });
          }
        }
      ]
    });
    await alert.present();
  }
  buttonBack(){
    if (this.formEditBtb.dirty){
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
  onWantEdit(){
    this.tenThietBis.markAsPristine();
    if (this.isWantEditTenTb){
      this.isWantEditTenTb = false;
    }
    else{
      this.isWantEditTenTb = true;
      // this.tenThietBis.reset();
      let i = 0;
      this.tenThietBis.markAsUntouched();
      this.lstDevice.forEach(el => {
        this.tenThietBis.at(i).patchValue({label: el.displayName});
        // this.addTbi({label:el.label?el.label:el.name});
        i++;
      });
    }
  }
  onEditTenTB(indexInput: number){
    const idThietbi = this.lstDevice[indexInput].id;
    const labelThietbi = this.formEditBtb.value.tenThietBis[indexInput].label;
    this.damtomService.putTenThietBi(idThietbi, labelThietbi).subscribe(async (res) => {
      this.showToastNotify('Cập nhật thành công', 'success');
      // this.tenThietBis.at(indexInput).patchValue(res.label);
      this.lstDevice[indexInput].displayName = res.label;
      this.isWantEditTenTb = false;
      this.tenThietBis.at(indexInput).markAsPristine();
    },
    err => {
      console.log(err);
      this.showToastNotify('Cập nhật thất bại', 'danger');
      }
    );
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

  // get thong tin gw tu server
  async getSpecificationsGw() {
    const dataList = await this.damtomService.getInfoDeviceOrGateway(this.idBtb, true).toPromise();

    dataList.forEach(data => {
      if (data.key === KeySpecificationsGw.ID){
        this.specificationsGw.id = data.valueAsString;
      }else if (data.key === KeySpecificationsGw.IMEI){
        this.specificationsGw.imei = data.valueAsString;
      }else if (data.key === KeySpecificationsGw.IP){
        this.specificationsGw.ip = data.valueAsString;
      }else if (data.key === KeySpecificationsGw.MAC){
        this.specificationsGw.mac = data.valueAsString;
      }
    });

  }

  public async infoGateway() {
    const alert = await this.alertCtl.create({
      header: this.formEditBtb.get('tenbtb').value,
      backdropDismiss: true,
      cssClass: 'infoGateway',
      // message: `<p>ID: ${this.specificationsGw.id} </p>` +
      //     `<p>IMEI: ${this.specificationsGw.imei}</p>` +
      //     `<p>MAC: ${this.specificationsGw.mac}</p>` +
      //     `<p>IP: ${this.specificationsGw.ip}</p>`,
      inputs: [
        {
          name: 'ID',
          type: 'text',
          placeholder: 'ID',
          value: this.specificationsGw.id,
        },
        {
          name: 'IMEI',
          type: 'text',
          placeholder: 'IMEI',
          value: this.specificationsGw.imei,
        },
        {
          name: 'MAC',
          type: 'text',
          placeholder: 'MAC',
          value: this.specificationsGw.mac,
        },
        {
          name: 'IP',
          type: 'text',
          placeholder: 'IP',
          value: this.specificationsGw.ip,
        }
      ],
      buttons: [
        {
          text: 'Xác nhận',
          handler: (value) => {
            console.log('414',value);
            const infoGW = {
              ID: value.ID,
              IMEI: value.IMEI,
              MAC: value.MAC,
              IP: value.IP,
            }
            this.specificationsGw.id = value.ID;
            this.specificationsGw.imei = value.IMEI;
            this.specificationsGw.mac = value.MAC;
            this.specificationsGw.ip = value.IP;
            
            this.damtomService.saveInforDeviceOrGw(this.idGwForEditInfo, infoGW)
            .subscribe(resData => {
              console.log('resData when update info gw', resData);
            })
          }
        }
      ]
    });
    await alert.present();
  }

  public async infoDevice(idDevice: string) {
    const modal = await this.modalCtrl.create({
      component: ThongTinThietBiComponent,
      swipeToClose: true,
      backdropDismiss: true,
      componentProps: {
        'idDevice': idDevice,
        'idDamTom': this.idDamtom
      },
      cssClass: 'custom-modal-info-device'
    });

    await modal.present();

    // data modal info device tra ve
    const data = await  modal.onWillDismiss();
    if (!!data.data){
      this.damtomService.getInfoDevice(data.data).subscribe(res => {
        const device = this.lstDevice.find(device => {
          return device.id === data.data;
        });
        device.displayName = !!res.device.label ? res.device.label : res.device.name;
      });
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

  async addSpecialDevice() {
    const modal = await this.modalCtrl.create({
      component: AddDeviceSpecialComponent,
      swipeToClose: true,
      backdropDismiss: true,
      componentProps: {
        damTomId: this.idDamtom,
        gatewayId: this.idBtb
      },
    });

    await modal.present();
    const rs = await modal.onWillDismiss();
    // console.log('data dismiss sd', rs);
    if (!!rs.data) {
      this.listDeviceSpecial.push(rs.data.specialDevice);
      setTimeout(() => {
        this.getListDeviceSpecial();
      }, 1000);
    }
  }

  getRpcRem() {
    this.damtomService.getListRem(this.idDamtom).subscribe(resData => {
      resData.RPC.forEach(device => {
        if (device.deviceType === 'REM') {
          this.listRpcRem.push(device);
        }
      });
    });
  }
  getListDeviceSpecial() {
    this.damtomService.getListDeviceSpecial(this.idDamtom, this.idBtb).subscribe(resData => {
      this.listDeviceSpecial = resData;
      console.log('list special device', resData);
    });
  }

  async infoSpecialDevice(deviceSpecial: SpecialDevice) {
    const idPull = deviceSpecial.rpcPullId;
    const idPush = deviceSpecial.rpcPushId;

    const modal = await this.modalCtrl.create({
      component: InfoDeviceSpecialComponent,
      swipeToClose: true,
      backdropDismiss: true,
      componentProps: {
        damTomId: this.idDamtom,
        gatewayId: this.idBtb,
        specialDv: deviceSpecial,
        idRpcPush: idPush,
        idRpcPull: idPull
      },
    });

    await modal.present();
    const rs = await modal.onWillDismiss();
    if (!!rs.data) {
      setTimeout(() => {
        this.getListDeviceSpecial();
      }, 500);
    }
  }
}
