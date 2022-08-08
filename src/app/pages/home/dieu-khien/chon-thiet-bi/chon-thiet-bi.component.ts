import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, ModalController } from '@ionic/angular';
import { DeviceEntityList, DeviceZone } from 'src/app/shared/models/dieukhien.model';

@Component({
  selector: 'app-chon-thiet-bi',
  templateUrl: './chon-thiet-bi.component.html',
  styleUrls: ['./chon-thiet-bi.component.scss'],
})
export class ChonThietBiComponent implements OnInit {
  @ViewChild (IonContent, {static: true}) content: IonContent;
  isGoTop = false;
  @Input() checkboxInputs: any[];
  @Input() listDevices: DeviceZone[];

  optionSelected = 'rem';

  listZoneRpc: DeviceZone[];
  listRem: DeviceZone[];

  isNodataRem = true;


  constructor(
    private modalCtrl: ModalController,
    private router: Router,
  ) { }

  ngOnInit() {
    this.listZoneRpc = this.getAnotherRpc();
    this.listRem = this.getListRem();
  }

  closeModal() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
  changeCheckBox(event, index, optionSelected) {
    if (optionSelected === 'rem') {
      // reset rpc thuong
      this.listZoneRpc.forEach(zone => {
        zone.deviceEntityList.forEach(device => {
          device.isChecked = false;
        });
      })
    }
    if (optionSelected === 'another') {
      // reset rem
      this.listRem.forEach(zone => {
        zone.deviceEntityList.forEach(rem => {
          rem.isChecked = false;
        });
      })
    }
  }
  xacNhan() {
    const deviceZ: DeviceEntityList[] = [];
    this.listDevices.forEach(zone => {
      zone.deviceEntityList.forEach(dv => {
        if (dv.isChecked){
          deviceZ.push(dv);
        }
      });
    });
    this.modalCtrl.dismiss({
      deviceSelected: deviceZ
    });
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

  changeOption(event: any) {
    console.log(this.getListRem());
  }
  getListRem(): DeviceZone[] {
    return this.listDevices.map((zone) => {
      return {
        ...zone,
        deviceEntityList: zone.deviceEntityList.filter(rpc => rpc.type === 'REM'),
      }
    });
  }

  getAnotherRpc(): DeviceZone[] {
    return this.listDevices.map((zone) => {
      return {
        ...zone,
        deviceEntityList: zone.deviceEntityList.filter(rpc => rpc.type !== 'REM'),
      }
    });
  }

  lengthRpcRem() {
    this.getListRem().forEach(zone => {
      this.isNodataRem = zone.deviceEntityList.length > 0;
      if (this.isNodataRem) return;
    });
  }

  changePullPush(event: any) {
    // reset device selected
    
    // if (this.action !== 'UPDATE') {
    //   this.listZoneRpc.forEach(zone => {
    //     zone.deviceEntityList.forEach(device => {
    //       device.isChecked = false;
    //     });
    //   })
  
    //   this.listRem.forEach(zone => {
    //     zone.deviceEntityList.forEach(rem => {
    //       rem.isChecked = false;
    //     });
    //   })
    // }
  }
}
