import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import * as moment from 'moment';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ActionRem, DieuKhienService } from 'src/app/core/services/dieu-khien.service';
import { SpecialDevice } from '../../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';

@Component({
  selector: 'app-dieu-khien-rem',
  templateUrl: './dieu-khien-rem.component.html',
  styleUrls: ['./dieu-khien-rem.component.scss'],
})
export class DieuKhienRemComponent implements OnInit {
  @Input() specialDevice: SpecialDevice;
  iconRpc = {
    Rèm: {
      iconThu: 'assets/icon-darkmode/8_Rem_active.png',
      iconRai: 'assets/icon-darkmode/15_remdong_active.png',
      iconThuDung: 'assets/icon-darkmode/8_Rem_deactive.png',
      iconRaiDung: 'assets/icon-darkmode/15_remdong_deactive.png',
      iconThuMkn: 'assets/icon-darkmode/8_Rem_dis.png',
      iconRaiMkn: 'assets/icon-darkmode/15_remdong_dis.png',
    },
  };
  interval = null;

  constructor(
    private modalCtrl: ModalController,
    private dieukhienService: DieuKhienService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.intervalUpdateState();
    console.log('ngOnInit dk rem', this.specialDevice);
    
  }

  getRemById() {
    this.dieukhienService.getRemById(this.specialDevice.id).subscribe(resData => {
      this.specialDevice = resData;
    })
  }
  
  cancelModal() {
    this.modalCtrl.dismiss({
      
    });
  }

  controlRem(mode: string) {
    const action: ActionRem = {
      id: this.specialDevice.id,
      rpcRemMode: mode, // PUSH - PULL - STOP
      stopOption: this.getStopOption(mode),
    }
    this.dieukhienService.controlRem(action).subscribe(resData => {
      this.dieukhienService.showToast('Gửi lệnh điều khiển rèm thành công', 'success');
      if (mode === 'STOP') {
        console.log('STOP');
        this.specialDevice.rpcPullDevice.statusDevice = 0;
        this.specialDevice.rpcPushDevice.statusDevice = 0;
        this.specialDevice.latestAction = 'STOP';
      } else if (mode === 'PUSH') {
        console.log('PUSH');
        this.specialDevice.rpcPushDevice.statusDevice = 1;
        this.specialDevice.latestAction = 'PUSH';
      } else if ( mode === 'PULL') {
        console.log('PULL');
        this.specialDevice.rpcPullDevice.statusDevice = 1;
        this.specialDevice.latestAction = 'PULL';
      }
    }, err => {
      console.log('error control rem', err);
      if (err.error.errorCode === 31) {
        this.dieukhienService.showToast(err.error.message, 'danger');
      } else if (err.error.errorCode === 30) {
        this.dieukhienService.showToast(err.error.message, 'danger');
      }
      else if (err.error.status === 500) {
        this.dieukhienService.showToast('Gửi lệnh điều khiển rèm thất bại!', 'danger');
      }
    })
  }

  intervalUpdateState() {
    this.stopInterval();
    this.interval = setInterval(() => {
    console.log('dk rem',this.interval);
      this.getStatusRemById();
    }, 2500)
  }

  stopInterval() {
    if (!this.interval) {
      return;
    }
    clearInterval(this.interval);
    this.interval = null;
  }

  getStatusRemById() {
    this.dieukhienService.getRemById(this.specialDevice.id).pipe(
      tap(data => {
        data.pauseStatus = Number(this.caculateStatusRem(data).toFixed(0));
        
        if (data.pauseStatus > 99) {
          data.pauseStatus = 100;
        } else if (data.pauseStatus < 1) {
          data.pauseStatus = 0;
        }
        this.specialDevice.pauseStatus = data.pauseStatus;
        this.specialDevice.rpcPullDevice = data.rpcPullDevice;
        this.specialDevice.rpcPushDevice = data.rpcPushDevice;
        this.specialDevice.latestAction = data.latestAction;
        this.specialDevice.latestTimeAction = data.latestTimeAction;

      }),
      catchError(err => {
        return of({});
      })
    ).subscribe();
  }

  getStopOption(mode: string) {
    if (mode === 'PULL') return 0; // thu
    else if (mode === 'PUSH') return 100; // rai
    else return null;
  }

  getStatusRem() {
    if (this.specialDevice.rpcPullDevice.statusDevice === 1 && 
      this.specialDevice.rpcPushDevice.statusDevice === 0) {
      return 'Thu rèm'
    } else if (this.specialDevice.rpcPullDevice.statusDevice === 0 && 
      this.specialDevice.rpcPushDevice.statusDevice === 1) {
      return 'Rải rèm'
    } else if (this.specialDevice.rpcPullDevice.statusDevice === -1 && 
      this.specialDevice.rpcPushDevice.statusDevice === -1) {
      return 'Mất kết nối'
    } else if (this.specialDevice.rpcPullDevice.statusDevice === 0 && 
      this.specialDevice.rpcPushDevice.statusDevice === 0) {
      return 'Dừng'
    } else {
      return 'Không xác định'
    }
  }

  caculateStatusRem(rpcRem: any): number {
    const timeFinishPredict =
      (rpcRem.finishTime / 100) * Math.abs(rpcRem.oldStatus - rpcRem.pauseStatus)
      + rpcRem.latestTimeAction;
    const currentTime = moment().valueOf();
    const hasStartedTime = currentTime - rpcRem.latestTimeAction;
    const finishedTime = timeFinishPredict - rpcRem.latestTimeAction;
    if (rpcRem.latestAction === 'STOP'
      || (rpcRem.rpcPushDevice.statusDevice === 0 && rpcRem.rpcPullDevice.statusDevice === 0)
      || (rpcRem.rpcPushDevice.statusDevice !== 0
        && rpcRem.rpcPushDevice.statusDevice !== 1
        && rpcRem.rpcPullDevice.statusDevice !== 1
        && rpcRem.rpcPullDevice.statusDevice !== 0)) {
      return rpcRem.pauseStatus;
    } else if (rpcRem.latestAction === 'PUSH' && (rpcRem.rpcPushDevice.statusDevice !== 0)) {
      return rpcRem.oldStatus + (hasStartedTime / finishedTime)
        * 100
        * Math.abs(rpcRem.oldStatus - rpcRem.pauseStatus) / 100;
    } else if (rpcRem.latestAction === 'PULL' && (rpcRem.rpcPullDevice.statusDevice !== 0)) {
      return rpcRem.oldStatus - (hasStartedTime / finishedTime)
        * 100
        * Math.abs(rpcRem.oldStatus - rpcRem.pauseStatus) / 100;
    }
    return 0;
  }

  ngOnDestroy() {
    console.log('ngOnDestroy', this.interval);
    this.stopInterval();
  }

}
