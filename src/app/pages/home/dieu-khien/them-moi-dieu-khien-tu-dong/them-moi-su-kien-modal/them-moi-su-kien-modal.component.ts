import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import {
  SuKienDto,
  SuKienKieuDuLieuType,
} from 'src/app/shared/models/dam-tom-rpc-alarm';
import { Device } from 'src/app/shared/models/device-model';
import { AllDevice, AllDeviceNotType } from 'src/app/shared/models/luatcanhbao.model';

@Component({
  selector: 'app-them-moi-su-kien-modal',
  templateUrl: './them-moi-su-kien-modal.component.html',
  styleUrls: ['./them-moi-su-kien-modal.component.scss'],
})
export class ThemMoiSuKienModalComponent implements OnInit {
  @Input() devices: AllDevice;
  @Input() editData: SuKienDto;

  form: FormGroup;
  isLoading = false;

  telemetry = [
    {
      key: 'Temperature',
      display: 'Nhiệt độ (°C)',
      // icon: 'assets/icon/temperature.svg'

    },
    { key: 'Humidity',
      display: 'Độ ẩm (%)',
      // icon: 'assets/icon/humidity.svg'
    },
    {
      key: 'Lux',
      display: 'Ánh sáng (lux)',
      // icon: 'assets/icon/luminosity.svg',
    },
  ];
  customPopoverOptions: any = {
    header: 'Cảm biến',
    cssClass: 'my-custom-popover',
  };
  telemetryOptions = [
    {
      value: 'Temperature',
      display: 'Nhiệt độ (°C)',
      // icon: 'assets/icon/temperature.svg',
    },
    {
      value: 'Humidity',
      display: 'Độ ẩm (%)',
      // icon: 'assets/icon/humidity.svg',
    },
    {
      value: 'Lux',
      display: 'Ánh sáng (lux)',
      // icon: 'assets/icon/luminosity.svg',
    },
  ];

  constructor(
    // tslint:disable-next-line: variable-name
    public _modalController: ModalController,
    // tslint:disable-next-line: variable-name
    private _fb: FormBuilder
  ) {}

  ngOnInit() {
    this.form = this._fb.group({
      duLieuCamBien: [this.telemetry[0].key],
      kieuDuLieu: [SuKienKieuDuLieuType.BAT_KY],
      camBien: [''],
      tenCamBien: [''],
      nguongGiaTri: [
        '',
        { validators: [Validators.pattern('^[0-9]+([.,][0-9]{0,})?$')] },
      ],
      toanTu: ['GREATER_OR_EQUAL'],
      gatewayId: [''],
    });

    if (!!this.editData) {
      this.form = this._fb.group({
        duLieuCamBien: [this.editData.duLieuCamBien],
        kieuDuLieu: [this.editData.kieuDuLieu],
        camBien: [this.editData.camBien],
        tenCamBien: [this.editData.tenCamBien],
        nguongGiaTri: [
          this.editData.nguongGiaTri,
          { validators: [Validators.pattern('^[0-9]+([.,][0-9]{0,})?$')] },
        ],
        toanTu: [this.editData.toanTu],
        gatewayId: [this.editData.gatewayId],
      });
    }

    this.form.get('camBien').valueChanges.subscribe((value) => {
      if (!!value){
        const camBien : AllDeviceNotType = this.devices[this.form.get('duLieuCamBien').value]?.find((el) => el.id === value);
        const tenCamBien = camBien?.label ? camBien?.label : camBien.name;
        this.form.get('tenCamBien').patchValue(tenCamBien);
        this.form.get('gatewayId').patchValue(value);
      }
    });

    // Number(this.form.get('nguongGiaTri').value.replace(',','.'))Changes.subscribe((value) => {
    //   if (!value && value != 0) {
    //     this.form.get('nguongGiaTri').patchValue(0);
    //   }
    // });
  }

  dismissModal() {
    this._modalController.dismiss({});
  }

  onSubmit() {
    this._modalController.dismiss({
      data: this.form.value,
    });
  }

  isFormValid(): boolean {
    if (
      this.form.get('kieuDuLieu').value === SuKienKieuDuLieuType.CU_THE &&
      !this.form.get('camBien').value
    ) {
      return false;
    }
    return true;
  }

  getSensorDevice(): any[] {
    // return this.devices
    //   .filter((el) => {
    //     return el.telemetry.includes(this.form.get('duLieuCamBien').value);
    //   })
    //   .sort((a, b) => {
    //     if (a.name < b.name) {
    //       return -1;
    //     }
    //     if (a.name > b.name) {
    //       return 1;
    //     }
    //     return 0;
    //   })
    //   .map((el) => ({
    //     value: el.id,
    //     display: el.displayName,
    //   }));
    return this.devices[this.form.get('duLieuCamBien').value];
  }

  checkInputLux() {
    if (this.form.get('nguongGiaTri').dirty) {
      if (
        this.form.get('duLieuCamBien').value === 'Lux' &&
        (Number(this.form.get('nguongGiaTri').value.replace(',', '.')) < 0 ||
          Number(this.form.get('nguongGiaTri').value.replace(',', '.')) >
            100000)
      ) {
        return true;
      }
    }
  }

  checkInputHumidity() {
    if (this.form.get('nguongGiaTri').dirty) {
      if (
        this.form.get('duLieuCamBien').value === 'Humidity' &&
        (Number(this.form.get('nguongGiaTri').value.replace(',', '.')) < 0 ||
          Number(this.form.get('nguongGiaTri').value.replace(',', '.')) > 100)
      ) {
        return true;
      }
    }
  }

  checkInputTemp() {
    if (this.form.get('nguongGiaTri').dirty) {
      if (
        this.form.get('duLieuCamBien').value === 'Temperature' &&
        (Number(this.form.get('nguongGiaTri').value.replace(',', '.')) < 0 ||
          Number(this.form.get('nguongGiaTri').value.replace(',', '.')) > 100)
      ) {
        return true;
      }
    }
  }

  validNguongGiaTri() {
    if (
      this.checkInputHumidity() ||
      this.checkInputLux() ||
      this.checkInputTemp() ||
      this.form.get('nguongGiaTri').value === ''
    ) {
      return true;
    } else if (this.form.get('nguongGiaTri').hasError('pattern')) {
      return true;
    }
  }

  // checkSoThapPhanSauDauPhay(inputNumber) {
  //   const numberSplArr = inputNumber?.toString().trim().split('.');
  //   if (numberSplArr?.length > 1) {
  //     if (numberSplArr[1]?.length > 1) {
  //       return true;
  //     }
  //     else {
  //       return false;
  //     }
  //   }
  //   else {
  //     return false;
  //   }
  // }
  convertNguongGiaTri(event) {
    // (this.form.get('nguongGiaTri').value).toString().trim().length>0
    if (
      this.form.get('nguongGiaTri').dirty &&
      this.form.get('nguongGiaTri').value.toString().trim().length > 0
    ) {
      this.form
        .get('nguongGiaTri')
        .setValue(
          Number(this.form.get('nguongGiaTri').value.replace(',', '.')).toFixed(
            1
          )
        );
      if ((Number(this.form.get('nguongGiaTri').value) * 10) % 10 === 0) {
        this.form
          .get('nguongGiaTri')
          .setValue(Number(this.form.get('nguongGiaTri').value).toFixed(0));
      }
    }
  }
}
