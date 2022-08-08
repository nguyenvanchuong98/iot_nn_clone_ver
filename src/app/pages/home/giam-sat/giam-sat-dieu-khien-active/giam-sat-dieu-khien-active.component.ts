import { Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { DieuKhienService } from 'src/app/core/services/dieu-khien.service';
import { SpecialDevice } from '../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';
import { GiamSatDevice } from '../giam-sat-update.model';

@Component({
  selector: 'app-giam-sat-dieu-khien-active',
  templateUrl: './giam-sat-dieu-khien-active.component.html',
  styleUrls: ['./giam-sat-dieu-khien-active.component.scss'],
})
export class GiamSatDieuKhienActiveComponent implements OnInit {
  @Input() damTomIdInput: string;
  @Input() listRpcActive: GiamSatDevice[];
  @Input() listRpcRem: SpecialDevice[];

  iconRpc = {
    DEFAULT: {
      icon: 'assets/icon-darkmode/0_Controller_active.png',
    },
    DIEUKHIEN_KHAC: {
      icon: 'assets/icon-darkmode/0_Controller_active.png',
    },
    QUAT_HUT: {
      // icon: 'assets/icon-update/4_Quathut_xanh.png',
      icon: 'assets/icon-darkmode/4_Maychieu_acitve.png',
    },
    QUAT_GIO: {
      // icon: 'assets/icon-update/5_Quat_xanh.png',
      icon: 'assets/icon-darkmode/5_Quat_active.png',
    },
    DIEU_HOA: {
      // icon: 'assets/icon-update/7_Dieuhoa_xanh.png',
      icon: 'assets/icon-darkmode/7_Dieuhoa_active.png',
    },
    REM: {
      // icon: 'assets/icon-update/8_Rem_xanh.png',
      icon: 'assets/icon-darkmode/8_Rem_active.png',
    },
    Rèm: {
      iconThu: 'assets/icon-darkmode/8_Rem_active.png',
      iconRai: 'assets/icon-darkmode/15_remdong_active.png',
      iconThuDung: 'assets/icon-darkmode/8_Rem_deactive.png',
      iconRaiDung: 'assets/icon-darkmode/15_remdong_deactive.png',
      iconThuMkn: 'assets/icon-darkmode/8_Rem_dis.png',
      iconRaiMkn: 'assets/icon-darkmode/15_remdong_dis.png',
    },
    DEN: {
      // icon: 'assets/icon-update/6_Den_xanh.png',
      icon: 'assets/icon-darkmode/6_Den_active.png',
    },
    MAY_BOM: {
      // icon: 'assets/icon-update/10_Maybom_xanh.png',
      icon: 'assets/icon-darkmode/10_Maybom_active.png',
    },
  };

  accordionExpanded = true;
  interval = null;

  constructor(
    private router: Router,
    private dieuKhienService: DieuKhienService,
  ) { }

  ngOnInit(): void {
  }


  // tslint:disable-next-line: use-lifecycle-interface
  ngOnChanges() {
    if (this.listRpcActive?.length === 0 && this.listRpcRem?.length === 0) {
      this.accordionExpanded = false;
    } else {
      this.accordionExpanded = true;
    }
  }

  getStatusRem(rem: SpecialDevice) {
    if (rem.rpcPullDevice.statusDevice === 1 && rem.rpcPushDevice.statusDevice === 0) {
      return 'Thu'
    } else if (rem.rpcPullDevice.statusDevice === 0 && rem.rpcPushDevice.statusDevice === 1) {
      return 'Rải'
    } else if (rem.rpcPullDevice.statusDevice === -1 && rem.rpcPushDevice.statusDevice === -1) {
      return 'Mất kết nối'
    } else if ((rem.rpcPullDevice.statusDevice === 0 && rem.rpcPushDevice.statusDevice === 0)) {
      return 'Dừng'
    }
  }

  toggleAccordion() {
    this.accordionExpanded = !this.accordionExpanded;
  }

  xemAllRpc() {
    this.router.navigate(['/home/dieu-khien'], {queryParams: {tab: 0, damTomID: this.damTomIdInput}});
  }
  routerSpecificRpc(rpcId: string) {
    this.router.navigate(['/home/dieu-khien'], {queryParams: {tab: 0, rpcID: rpcId}});
  }

  caculationTimeDevice(time: number): string {
    let timeShow: string;
    const timeDuring = moment().valueOf() - time;
    if (time === 0) {
      timeShow = 'Không xác định';
    } else {
      const timeResult = Math.round(timeDuring / (1000 * 60)); // millisecond -> quy ra phut

      if (timeResult < 60) {
        timeShow = timeResult + ' phút trước';
      }
      // < 1 ngay -> hien thi gio
      else if (timeResult < 1440) {
        timeShow = Math.round(timeResult / 60) + ' giờ trước';
      }
      // > 1 ngay -> hien thi ngay
      else if (timeResult >= 1440) {
        timeShow = Math.round(timeResult / 1440) + ' ngày trước';
      }
      // > 1 tuan -> hien thi tuan
      else if (timeResult >= 10080) {
        timeShow = Math.round(timeResult / 10080) + ' tuần trước';
      }
      // > 1 thang -> hien thi thang
      else if (timeResult >= 43200) {
        timeShow = Math.round(timeResult / 43200) + ' tháng trước';
      }
    }

    return timeShow;
  }
}
