import { Component, Input, OnInit } from '@angular/core';
import {
  AlertController,
  ModalController,
  NavController,
} from '@ionic/angular';
import { GroupRPCService } from 'src/app/core/services/nhom-dieu-khien.service';
import { arrayEqual, escapedHTML } from 'src/app/shared/utils';
import { ThemMoiSuKienModalComponent } from '../them-moi-dieu-khien-tu-dong/them-moi-su-kien-modal/them-moi-su-kien-modal.component';
import { PickertimeGroupControlComponent } from './pickertimecontrolgroup/pickertimegc.component';
import { Router } from '@angular/router';
import {
  GroupRpc,
  StatusGroupRpcModel,
} from '../../../../shared/models/status-group-rpc.model';
import { interval, Subscription } from 'rxjs';
import { SpecialDevice } from '../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';

export class GRC {
  name: string;
  imgUrlPath: string;
  status: boolean;
}

@Component({
  selector: 'app-nhom-dieu-khien',
  templateUrl: './nhom-dieu-khien.component.html',
  styleUrls: ['./nhom-dieu-khien.component.scss'],
})
export class NhomDieuKhienComponent implements OnInit {
  isNhomDieuKhienLoading = false;
  powerOnImagePath = `./assets/images/nhom-dk.svg`;
  powerOffImagePath = `./assets/images/nhom-dk-off.svg`;
  isSwitch = false;
  @Input() damTomId: string;
  @Input() flagToRefresh: boolean;
  @Input() isLeavePageDk: boolean;
  interval = null;
  listGRC: GRC[] = [];
  listGroupRPC: GroupRpc[] = [];
  listStatusGroupRpc: string[] = [];
  subscription: Subscription;

  // NB - toi uu
  @Input() isLoadingDataFinish: boolean;

  constructor(
    // tslint:disable-next-line: variable-name
    public _modalController: ModalController,
    private router: Router,
    private modalCtrl: ModalController,
    private confirmAlart: AlertController,
    private groupRpc: GroupRPCService,
    private nav: NavController,
    private groupRPCService: GroupRPCService
  ) {}

  ngOnInit() {
    this.isNhomDieuKhienLoading = true;
  }
  async ionViewWillEnter(damTomId) {

    this.damTomId = damTomId;
    if (!this.damTomId) {
      return;
    }

    let boDieuKhienList = await this.groupRpc
      .getAllBoDieuKhien(this.damTomId)
      .toPromise();
    if (!boDieuKhienList) {
      boDieuKhienList = [];
    }
    // console.log(boDieuKhienList);
    boDieuKhienList.forEach((element) => {
      element.status = true;
      element.imgUrlPath = this.powerOffImagePath;
    });

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < boDieuKhienList.length; i++) {
      const status = await this.groupRPCService
        .getStatusGroupRpc(boDieuKhienList[i].groupRpcId)
        .toPromise();

      if (status.loading === true) {
        if (!this.listStatusGroupRpc.includes(boDieuKhienList[i].groupRpcId)) {
          this.listStatusGroupRpc.push(boDieuKhienList[i].groupRpcId);
        }
      } else {
        if (this.listStatusGroupRpc.includes(boDieuKhienList[i].groupRpcId)) {
          const index = this.listStatusGroupRpc.indexOf(
            boDieuKhienList[i].groupRpcId
          );
          this.listStatusGroupRpc.splice(index, 1);
        }
      }
    }

    // trungdt - kiểm tra nếu dữ liệu thay đổi thì mới cập nhật
    if (!arrayEqual(boDieuKhienList, this.listGroupRPC)) {
      this.listGroupRPC = boDieuKhienList;
    }

    this.isNhomDieuKhienLoading = false;
    // console.log('bat interval=========')
    this.interval = setInterval(() => {
      this.listGroupRPC.forEach((data) => {
        // this.getDeviceStatus(data);
        this.getStatusGroupRpc(data.groupRpcId);
      });
    }, 20000);
  }
  ionViewWillLeave() {
    this.listGroupRPC = [];
    clearInterval(this.interval);
    this.interval = null;
    // this.subscription.unsubscribe();
  }
  // tslint:disable-next-line: use-lifecycle-interface
  ngOnChanges() {
    if (!this.damTomId) {
      return;
    }
    // console.log('segmentChange=========',this.segmentChange);
    // console.log(this.damTomId);
    // this.subscription = this.groupRpc.getAllBoDieuKhien(this.damTomId).subscribe(boDieuKhienList=>{
    //   // console.log(boDieuKhienList);
    //   boDieuKhienList.forEach(element => {
    //     element.status = true;
    //     element.imgUrlPath = this.powerOffImagePath
    //   });
    //   this.listGroupRPC = boDieuKhienList;
    //   this.isNhomDieuKhienLoading = false;
    //   this.listGroupRPC.forEach((data) => {
    //     // this.getDeviceStatus(data);
    //     this.getStatusGroupRpc(data.groupRpcId);
    //   });
    //   if(this.segmentChange === 0){
    //     // console.log('bat interval=========')
    //     this.interval = setInterval(() => {
    //       this.listGroupRPC.forEach((data) => {
    //         // this.getDeviceStatus(data);
    //         this.getStatusGroupRpc(data.groupRpcId);
    //       });
    //     }, 10000);
    //     console.log('add interval=====',this.interval);
    //   }else{
    //     // console.log('tat interval======')
    //     console.log('76 clear interval=====',this.interval);
    //     clearInterval(this.interval);
    //     this.interval = null;
    //
    //   }
    //   // console.log(boDieuKhienList);
    // });
  }
  async openActionSheet() {
    const modal = await this._modalController.create({
      component: PickertimeGroupControlComponent,
      cssClass: 'group-control-modal-css',
      componentProps: {
        name: 'Cloud',
      },
      swipeToClose: true,
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
  }

  onOff(grc: GRC) {
    let mess: string;
    grc.status === false ? (mess = 'Khởi động') : (mess = 'Hủy khởi động');
    this.confirmAlart
      .create({
        message:
          mess +
          ' nhóm điều khiển ' +
          '"' +
          escapedHTML(grc.name.toString()) +
          '"',
        cssClass: 'my-alert-custom-class',
        buttons: [
          {
            text: 'Quay lại',
            role: 'cancel',
          },
          {
            text: 'Xác nhận',
            handler: () => {
              grc.status = !grc.status;
              grc.status
                ? (grc.imgUrlPath = this.powerOnImagePath)
                : (grc.imgUrlPath = this.powerOffImagePath);
            },
          },
        ],
      })
      .then((alCtr) => {
        alCtr.present();
      });
  }

  startGroupRpc(rpc: GroupRpc, groupRpcId: string) {
    this.confirmAlart
      .create({
        message:
          'Khởi động nhóm điều khiển ' +
          '"' +
          escapedHTML(rpc.name.toString()) +
          '"?',
        cssClass: 'my-alert-custom-class',
        buttons: [
          {
            text: 'Quay lại',
            role: 'cancel',
          },
          {
            text: 'Xác nhận',
            handler: () => {
              this.groupRPCService.startGroupRpc(groupRpcId).subscribe(
                (data) => {
                  this.listStatusGroupRpc.push(groupRpcId);
                },
                (error) => {
                  console.log('error start nhom rpc', error);
                }
              );
            },
          },
        ],
      })
      .then((alCtr) => {
        alCtr.present();
      });
  }
  stopGroupRpc(rpc: GroupRpc, groupRpcId: string) {
    this.confirmAlart
      .create({
        message:
          'Huỷ khởi động nhóm điều khiển ' +
          '"' +
          escapedHTML(rpc.name.toString()) +
          '"?',
        cssClass: 'my-alert-custom-class',
        buttons: [
          {
            text: 'Quay lại',
            role: 'cancel',
          },
          {
            text: 'Xác nhận',
            handler: () => {
              this.groupRPCService.stopGroupRpc(groupRpcId).subscribe(
                (data) => {
                  const index = this.listStatusGroupRpc.indexOf(groupRpcId);
                  this.listStatusGroupRpc.splice(index, 1);
                },
                (error) => {
                  console.log('error stop nhom rpc', error);
                }
              );
            },
          },
        ],
      })
      .then((alCtr) => {
        alCtr.present();
      });
  }
  checkStatusGroupRpc(groupRpcId: string) {
    return this.listStatusGroupRpc.includes(groupRpcId);
  }
  getStatusGroupRpc(groupRPCId: string) {
    this.groupRPCService.getStatusGroupRpc(groupRPCId).subscribe(
      (data: StatusGroupRpcModel) => {
        if (data.loading === true) {
          if (!this.listStatusGroupRpc.includes(data.groupRpcId)) {
            this.listStatusGroupRpc.push(data.groupRpcId);
          }
        } else {
          if (this.listStatusGroupRpc.includes(data.groupRpcId)) {
            const index = this.listStatusGroupRpc.indexOf(data.groupRpcId);
            this.listStatusGroupRpc.splice(index, 1);
          }
        }
      },
      (error) => {
        console.log('error get status group rpc');
      }
    );
  }

  openPageThongTinBoDk(groupRpcId) {
    this.router.navigate([
      '/',
      'home',
      'dieu-khien',
      'thong-tin-bo-dieu-khien',
      this.damTomId,
      groupRpcId,
      this.checkStatusGroupRpc(groupRpcId).toString(),
    ]);
    // this.router.navigate(['/','home','dieu-khien','thong-tin-bo-dieu-khien',rpcId]);
  }
  // swithcPath(){
  //   this.powerImagePath = `./assets/images/nhom-dk-off.svg`;
  // }
  themMoiBoDieuKhien() {
    this.router.navigate([
      '/',
      'home',
      'dieu-khien',
      'them-moi-bo-dieu-khien',
      this.damTomId
    ]);
  }
}
