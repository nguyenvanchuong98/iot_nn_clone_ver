import { LuatCanhBaoService } from './../../../../../core/services/luat-canh-bao.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { GiamSatService } from 'src/app/core/services/giam-sat.service';
import {
  AllDevice,
  AllDeviceNotType,
  DeviceProfileAlarmDto,
  LuatCBDto,
} from 'src/app/shared/models/luatcanhbao.model';
import { IonContent, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { deepClone } from 'src/app/core/utils';

@Component({
  selector: 'app-thiet-lap-luat-canh-bao',
  templateUrl: './thiet-lap-luat-canh-bao.page.html',
  styleUrls: ['./thiet-lap-luat-canh-bao.page.scss'],
})
export class ThietLapLuatCanhBaoPage implements OnInit {
  dsDamTom: any[] = [];
  @ViewChild(IonContent) gotoTop: IonContent;
  isGoTop = false;
  idVuon;
  isLoading = true;
  checkErr = false;
  formDieuKhien: FormGroup;
  message: string;
  ActiveLuatDto: DeviceProfileAlarmDto;
  listLuat;
  lstAllDvice: AllDevice;
  listAllSensorNotType: AllDeviceNotType[] = [];
  customActionSheetOptions: any = {
    header: 'Chọn nhà vườn',
    cssClass: 'my-custom-action-sheet',
  };

  constructor(
    private giamsatService: GiamSatService,
    private luatService: LuatCanhBaoService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.route.queryParams
      // tslint:disable-next-line: deprecation
      .subscribe((data) => {
        if (data) {
          this.initData(data);
        }
      });
    this.formDieuKhien = this.fb.group({
      selectDamTom: '',
    });
    this.formDieuKhien.get('selectDamTom').valueChanges.subscribe((value) => {
      this.changeVuon(value);
    });
  }

  setDamTomId(id: string) {
    if (id == null) {
      return;
    }
    this.idVuon = id;
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: { damTomGsId: id },
    });
    if (this.idVuon) {
      this.getLuatCanhBaoByDamTomID(this.idVuon);
      this.getAllSensorDevice();
    }
  }

  checkExistIdDamtom(idInput: string) {
    return !!this.dsDamTom.find((e) => e.id === idInput) ? true : false;
  }

  async initData(urlParams) {
    this.isLoading = true;
    try {
      const respose = await this.giamsatService.getDanhSachDamTom().toPromise();
      this.dsDamTom = respose;
    } catch (error) { }
    if (!!urlParams.damTomGsId) {
      if (this.checkExistIdDamtom(urlParams.damTomGsId)) {
        this.setDamTomId(urlParams.damTomGsId);
      } else {
        this.setDamTomId(this.dsDamTom[0]?.id);
      }
    } else {
      this.setDamTomId(this.dsDamTom[0]?.id);
    }
    this.formDieuKhien.get('selectDamTom').patchValue(this.idVuon);
    if (!this.idVuon) {
      this.isLoading = false;
    }
  }

  async getLuatCanhBaoByDamTomID(id: string) {
    const data = await this.luatService.getListLuatbyIdDam(id).toPromise();
    if (data) {
      // if (data !== null && data !== undefined) {
      data.map((e) => {
        if (e.createRules.CRITICAL.schedule) {
          e.fromTime = this.millisToStr2(
            e.createRules.CRITICAL.schedule.startsOn
          );
          e.toTime = this.millisToStr2(
            e.createRules.CRITICAL.schedule.endsOn
          );
        }
      });
      this.listLuat = data.sort(
        (a, b) => b.dftAlarmRule.createdTime - a.dftAlarmRule.createdTime
      );
    }
    else {
      this.listLuat = [];
    }
    this.isLoading = false;
  }
  ionViewWillEnter() {
    this.checkErr = false;
  }

  async onActiveLuat(event, idLuat, damTomId) {
    this.luatService.activeLuat(damTomId, idLuat, event.detail.checked).subscribe(res => {
       console.log('Active success !', res);
    },
    err => {
      console.log('Err-------------------',err);
      this.showToast('Thay đổi trạng thái thất bại !', 'danger');
    });
  }
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

  changeVuon(event) {
    this.setDamTomId(event);
  }

  goTop() {
    this.gotoTop.scrollToTop(0);
  }
  logScrolling(event) {
    if (event.detail.scrollTop === 0) {
      this.isGoTop = false;
    } else {
      this.isGoTop = true;
    }
  }

  // chuyển sang chế độ dark mode
  switchMode() {
    const darkMode = document.body.getAttribute('color-theme');
    if (darkMode === 'dark') {
      document.body.setAttribute('color-theme', 'light');
    } else {
      document.body.setAttribute('color-theme', 'dark');
    }
  }

  // Lấy danh sách cảm biến
  getAllSensorDevice(){
    this.luatService.getAllDevice(this.idVuon).subscribe(res => {
      this.lstAllDvice = res;
      this.listAllSensorNotType = this.listAllSensorNotType.concat(this.lstAllDvice.Temperature)
      .concat(this.lstAllDvice.Humidity)
      .concat(this.lstAllDvice.Lux);
    });
  }

  // Lay loai cam bien từ key
  getTbKeyByTelemetryKey(key: string) {
    const device = this.listAllSensorNotType.find(data => data.telemetryType[0] === key);
    return device.tbKey;
  }

  // hàm refresh lại trang khi scroll top
  doRefresh(event) {
    setTimeout(() => {
      this.ionViewWillEnter();
      event.target.complete();
    }, 1000);
  }
  private showToast(message: string, color: string) {
    this.toastCtrl
    .create({
      message,
      color,
      duration: 2000,
    })
    .then((toastEL) => toastEL.present());
  }
}
