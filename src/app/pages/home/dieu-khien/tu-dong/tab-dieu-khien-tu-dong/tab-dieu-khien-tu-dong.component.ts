import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DamTomRpcAlarmService } from 'src/app/core/services/dam-tom-rpc-alarm.service';
import { DieuKhienService } from 'src/app/core/services/dieu-khien.service';
import { DamTomRpcAlarm } from 'src/app/shared/models/dam-tom-rpc-alarm';
import { arrayEqual } from 'src/app/shared/utils';

@Component({
  selector: 'app-tab-dieu-khien-tu-dong',
  templateUrl: './tab-dieu-khien-tu-dong.component.html',
  styleUrls: ['./tab-dieu-khien-tu-dong.component.scss'],
})
export class TabDieuKhienTuDongComponent implements OnInit {
  isLoading = false;
  timeoutRef = null;
  @Input() damTomId: string;
  alarms: DamTomRpcAlarm[] = [];
  constructor(
    // tslint:disable-next-line: variable-name
    private _damTomRpcAlarmService: DamTomRpcAlarmService,
    // tslint:disable-next-line: variable-name
    private _toastCtl: ToastController,
    // tslint:disable-next-line: variable-name
    private _router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((data) => {
      clearTimeout(this.timeoutRef);
      // this.alarms = [];
      this.isLoading = true;
      if (this.damTomId == null){
        return;
      }
      this._damTomRpcAlarmService.getAll(this.damTomId).subscribe(
        // tslint:disable-next-line: no-shadowed-variable
        (data: DamTomRpcAlarm[]) => {
          this.isLoading = false;
          if (!data) {
            data = [];
          }
          // trungdt - kiểm tra nếu dữ liệu thay đổi thì mới cập nhật
          if (!arrayEqual(data, this.alarms)) {
            this.alarms = data;
            this.alarms.map((e) => {
              if (e.createRules.MAJOR.schedule) {
                e.fromTime = this.millisToStr2(
                  e.createRules.MAJOR.schedule.startsOn
                );
                e.toTime = this.millisToStr2(
                  e.createRules.MAJOR.schedule.endsOn
                );
              }
            });
          }
        },
        (error) => {
          this.isLoading = false;
        }
      );
    });
  }
  
  // tslint:disable-next-line: use-lifecycle-interface
  ngOnChanges(changes: SimpleChanges) {
    if (this.damTomId == null){
      return;
    }
    this.isLoading = true;
    this._damTomRpcAlarmService.getAll(this.damTomId).subscribe(
      // tslint:disable-next-line: no-shadowed-variable
      (data: DamTomRpcAlarm[]) => {
        this.isLoading = false;
        if (!data) {
          data = [];
        }

        // trungdt - kiểm tra nếu dữ liệu thay đổi thì mới cập nhật
        if (!arrayEqual(data, this.alarms)) {
          this.alarms = data;
          this.alarms.map((e) => {
            if (e.createRules.MAJOR.schedule) {
              e.fromTime = this.millisToStr2(
                e.createRules.MAJOR.schedule.startsOn
              );
              e.toTime = this.millisToStr2(
                e.createRules.MAJOR.schedule.endsOn
              );
            }
          });
        }
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  /*  trungdt
   *  bắt sự kiện mỗi khi alarm active thay đổi giá trị và gọi api lưu dữ liệu
   */
  onChangeAlarmStatus(status, index) {
    this.alarms[index].dftAlarmRule.active = status;
    this._damTomRpcAlarmService
      .activeAlarm(this.damTomId, this.alarms[index] as any)
      .subscribe(
        () => {},
        (error) => {
          // trungdt - nếu xảy ra lỗi thì reset lại trạng thái active của alarm
          this.timeoutRef = setTimeout(() => {
            this.alarms[index].dftAlarmRule.active = !status;
          }, 100);

          this._toastCtl
            .create({
              message: error?.error?.message,
              color: 'danger',
              duration: 5000,
            })
            .then((toastCtrl) => {
              toastCtrl.present();
            });
        }
      );
    // this._damTomRpcAlarmService.saveAlarm({
    //   damtomId: this.damTomId,
    //   deviceProfileAlarm: this.alarms[index] as any
    // })
    //   .subscribe(
    //     () => {
    //       console.log('save success ------ ');
    //     },
    //     (error) => {
    //       // trungdt - nếu xảy ra lỗi thì reset lại trạng thái active của alarm
    //       this.timeoutRef = setTimeout(() => {
    //         this.alarms[index].dftAlarmRule.active = !status;
    //       }, 100);

    //       this._toastCtl.create({
    //         message: error?.error?.message,
    //         color: 'danger',
    //         duration: 5000
    //       }).then(toastCtrl => {
    //         toastCtrl.present();
    //       })
    //     });
  }

  editAlarm(obj: DamTomRpcAlarm) {
    this._router.navigate(['/home/dieu-khien/thong-tin-dieu-khien-tu-dong'], {
      queryParams: {
        damTomId: this.damTomId,
        alarmType: obj.alarmType,
      },
    });
  }

  /* Chuong NV
   * Chuyen thoi gian sang string
   */
  pad(num, size) {
    num = num.toString();
    while (num.length < size) { num = '0' + num; }
    return num;
  }
  millisToStr2(ms: number) {
    let seconds = ms / 1000;
    // tslint:disable-next-line: radix
    const hours = parseInt(seconds / 3600 + '');
    seconds = seconds % 3600;
    // tslint:disable-next-line: radix
    const minutes = parseInt(seconds / 60 + '');
    seconds = seconds % 60;
    return `${this.pad(hours, 2)}:${this.pad(minutes, 2)}`;
  }
}
