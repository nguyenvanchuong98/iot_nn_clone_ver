import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonRadioGroup, IonSlides, ModalController, ToastController } from '@ionic/angular';
import { ActionRem, DieuKhienService } from 'src/app/core/services/dieu-khien.service';
import { QuantridamtomService } from 'src/app/core/services/quantridamtom.service';
import { SpecialDevice } from '../../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';

@Component({
  selector: 'app-thiet-lap-dk-rem',
  templateUrl: './thiet-lap-dk-rem.component.html',
  styleUrls: ['./thiet-lap-dk-rem.component.scss'],
})
export class ThietLapDkRemComponent implements OnInit {
  @ViewChild ('radioGroup') radioGroup: IonRadioGroup;
  @Input() deviceRem: SpecialDevice; // special device
  
  @ViewChild('slides', { static: true }) slider: IonSlides;

  formSetting: FormGroup;
  listPercent = [25, 50, 75, 100];

  isInvalidPercent = true;

  titlePullPush = '';

  // 
  timeHandle = 0;

  segment = 0;


  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private damtomService: QuantridamtomService,
    private dieukhienService: DieuKhienService,
    private toastCtrl: ToastController
  ) {
   }

  ngOnInit() {

    this.formSetting = this.fb.group({
      optionControl: [this.deviceRem.pauseStatus === 100 ? 'PULL' : 'PUSH'],
      percentControl: [],
      timeControl: []
    })
    this.titlePullPush = 'Tỷ lệ';
    // console.log('deviceRem', this.deviceRem);
  }
  getInfoSpecialDevice() {
    this.damtomService.getSpecialDvById(this.deviceRem.id).subscribe(resData => {
      console.log(resData, this.deviceRem);
    });
  }
  
  changeRadioPercent(event: any) {
    if (event.detail.value !== null) {
      this.formSetting.get('percentControl').setValue(event.detail.value);
    }
  }
  changePullPush(event) {
    if (event.detail.value === 'PUSH') {
      this.titlePullPush = "Tỷ lệ rải";
    } else {
      this.titlePullPush = "Tỷ lệ thu";
    }
    this.formSetting.get('percentControl').setValue('');
    this.radioGroup.value = '';    
  }
  changePercentInput(event) {
    const elementError = document.getElementById('error');
    if (parseInt(event.detail.value, 10) <= 100 && parseInt(event.detail.value, 10) > 0) {
      elementError.classList.add('hidden');
      this.isInvalidPercent = false;
      if (event.detail.value !== '25' && event.detail.value !== '50' && event.detail.value !== '75' && event.detail.value !== '100') 
      {
        this.radioGroup.value = null;
      } 
      else {
        this.radioGroup.value = parseInt(event.detail.value, 10);
        // console.log('== 25 50 75 100');
      }
    } else if (parseInt(event.detail.value, 10) > 100 ) {
      // console.log('>100');
      this.isInvalidPercent = true;
      elementError.classList.remove('hidden');
      // this.formSetting.get('percentControl').setValue(100);
    } else if (parseInt(event.detail.value, 10) < 0) {
      // console.log('<0');
      elementError.classList.remove('hidden');
      // this.formSetting.get('percentControl').setValue(0);
    } else {
      this.isInvalidPercent = true;
      elementError.classList.add('hidden');
    }
  }
  onSubmit(){
    const action: ActionRem = {
      id: this.deviceRem.id,
      rpcRemMode: this.formSetting.value.optionControl, // PUSH - PULL - STOP
      stopOption: this.formSetting.value.percentControl,
    }
    this.dieukhienService.controlRem(action).subscribe(resData => {
      this.showToast('Gửi lệnh điều khiển rèm thành công', 'success');
      this.modalCtrl.dismiss();
    }, err => {
      console.log('error control rem', err);
      if (err.error.errorCode === 31) {
        this.showToast(err.error.message, 'danger');
      } else if (err.error.errorCode === 30) {
        this.showToast(err.error.message, 'danger');
      }
      else if (err.error.status === 500) {
        this.showToast('Gửi lệnh điều khiển rèm thất bại!', 'danger');
      }
    })
  }

  private showToast(meseage: string, colorInput: string) {
    this.toastCtrl
      .create({
        message: meseage,
        color: colorInput,
        duration: 3000,
      })
      .then((toatEL) => toatEL.present());
  }
  huyBo() {
    this.modalCtrl.dismiss();
  }

  msToTime(duration) {
    // tinh time xu ly rai-thu    
    // if (this.deviceRem.oldStatus === 0) {
    //   duration = this.deviceRem.finishTime * (this.formSetting.value.percentControl / 100);
    // }
    if (!!this.formSetting.value.percentControl) {
      duration = (this.deviceRem.finishTime / 100) * Math.abs(this.deviceRem.pauseStatus - this.formSetting.value.percentControl);
    } else {
      return '00:00:00';
    }

    // convert 00:00:00
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    let hoursStr = (hours < 10) ? '0' + hours : hours.toString();
    let minutesStr = (minutes < 10) ? '0' + minutes : minutes.toString();
    let secondsStr = (seconds < 10) ? '0' + seconds : seconds.toString();
  
    return hoursStr + ":" + minutesStr + ":" + secondsStr;
  }


  async segmentChanged() {
    await this.slider.slideTo(this.segment);
  }

  async slideChanged() {
    this.segment = await this.slider.getActiveIndex();
  }

}
