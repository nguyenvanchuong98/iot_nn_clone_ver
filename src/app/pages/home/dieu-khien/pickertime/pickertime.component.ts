import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RpcRequest } from '../../../../shared/models/rpc-request.model';
import { ModelData } from '../dieu-khien.page';
import { DieuKhienService } from '../../../../core/services/dieu-khien.service';
import { catchError, delay, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-pickertime',
  templateUrl: './pickertime.component.html',
  styleUrls: ['./pickertime.component.scss'],
})
export class PickertimeComponent implements OnInit {
  numberSelect: Array<number> = [];
  checkLoopOption;
  entityForm: FormGroup;
  @Input() modelData: ModelData;
  customPopoverOptions: any = {
    cssClass: 'my-custom-popover',
  };
  constructor(
    private fb: FormBuilder,
    private dieuKhienService: DieuKhienService,
    private modalCtrl: ModalController
  ) {}
  buildFormControlRpc() {
    this.entityForm = this.fb.group({
      timeCallBack: ['00:00:00', Validators.required],
      loopOption: [false, []],
      timeDuringLoop: [{ value: '00:00:00', disabled: true }],
      loopCount: [
        { value: 1, disabled: true },
        [Validators.min(1), Validators.max(100), Validators.required],
      ],
    });
  }
  ngOnInit() {
    for (let i = 1; i <= 100; i++) {
      this.numberSelect.push(i);
    }
    this.buildFormControlRpc();
    // console.log('modaldata: ', this.modelData.deviceRpc);
  }
  // convert to millisecond
  convertTimeToMs(time): number {
    let hour = new Date(time).getHours();
    const minutes = new Date(time).getMinutes();
    const second = new Date(time).getSeconds();
    if (time === 0) {
      hour = 0;
    }
    const timeResult =
      hour * 60 * 60 * 1000 + minutes * 60 * 1000 + second * 1000;
    return timeResult;
  }
  toMillis(str: string): number {
    const arr = str.split(':');
    // chỉ xử lý định dạng HH:mm:ss hoặc HH:mm
    if (arr.length < 2 || arr.length > 3) {
      return;
    }
    // tslint:disable-next-line: radix
    const hour = !!arr[0] ? parseInt(arr[0]) : 0;
    // tslint:disable-next-line: radix
    const minute = !!arr[1] ? parseInt(arr[1]) : 0;
    // tslint:disable-next-line: radix
    const second = !!arr[2] ? parseInt(arr[2]) : 0;

    return hour * 60 * 60 * 1000 + minute * 60 * 1000 + second * 1000;
  }
  async onSubmitControlDevice() {
    if (this.entityForm.get('timeCallBack').value === 0) {
      // console.log(
      //   'timeCallBackValue: ',
      //   this.entityForm.get('timeCallBack').value
      // );
      return;
    } else {
      const timeCallBackValue = this.toMillis(
        this.entityForm.get('timeCallBack').value
      );
      // console.log('timeCallBackValue', timeCallBackValue);
      let timeLoop = 0;
      let loopCount = 0;
      const loopOption = this.entityForm.get('loopOption').value;

      if (loopOption) {
        timeLoop = this.toMillis(this.entityForm.get('timeDuringLoop').value);
        // console.log('timeDuringLoop', timeLoop);
        loopCount = this.entityForm.get('loopCount').value;
      }
      const rpcRequestBody: RpcRequest = {
        damTomId: this.modelData.deviceRpc.damTomId,
        deviceId: this.modelData.deviceRpc.deviceId,
        deviceName: this.modelData.deviceRpc.tenThietBi,
        setValueMethod: this.modelData.deviceRpc.setValueMethod,
        valueControl: this.modelData.valueControl,
        callbackOption: true,
        timeCallback: timeCallBackValue,
        loopOption,
        loopCount,
        loopTimeStep: timeLoop,
      };
      this.modalCtrl.dismiss(this.modelData.deviceRpc.deviceId);

      await this.dieuKhienService.saveManualRpcToCommandQueue(rpcRequestBody).toPromise()
      .then(data => {
        // console.log(data);
      })
      .catch(err => {
        console.log('co loi xay ra', err);
      });
    }
  }
  checkBoxOption() {
    this.checkLoopOption = this.entityForm.get('loopOption').value;
    // console.log(this.checkLoopOption);
    if (this.checkLoopOption) {
      this.entityForm.controls.loopCount.enable();
      this.entityForm.controls.timeDuringLoop.enable();
    } else {
      this.entityForm.controls.loopCount.disable();
      this.entityForm.controls.timeDuringLoop.disable();
    }
  }
  huyPickerTime() {
    this.modalCtrl.dismiss();
  }
  // dismiss() {
  //   this.modalCtrl.dismiss();
  // }
}
