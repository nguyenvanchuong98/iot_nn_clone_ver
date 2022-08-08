import { Gateways } from './../../../shared/models/giamsat.model';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { GiamSatService } from './../../../core/services/giam-sat.service';
import { DamTom } from 'src/app/shared/models/giamsat.model';
import { IonContent, IonSlides } from '@ionic/angular';
import { DashboardDataComponent } from './dashboard-data/dashboard-data.component';
import { arrayEqual } from 'src/app/shared/utils';
import { GiamSatServiceUpdate } from './giam-sat-update.service';
import { DeviceType, GiamSatDamTom, TelemetryType, Zone } from './giam-sat-update.model';
import { of, Subscription } from 'rxjs';
import * as moment from 'moment';
import { catchError, map, tap } from 'rxjs/operators';
import { DieuKhienServiceUpdate } from '../dieu-khien/dieu-khien-update.service';
import { DieuKhienService } from 'src/app/core/services/dieu-khien.service';
import { DieuKhienDamTom } from '../dieu-khien/dieu-khien-update.model';
import { ActivatedRoute, Router } from '@angular/router';
import { GiamSatDieuKhienActiveComponent } from './giam-sat-dieu-khien-active/giam-sat-dieu-khien-active.component';
import { SpecialDevice } from '../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';
export interface Device {
  gatewayId: string;
  deviceId: string;
  deviceName: string;
  deviceLabel: string;
  dataDevice: any[];
}
@Component({
  selector: 'app-giam-sat',
  templateUrl: './giam-sat.page.html',
  styleUrls: ['./giam-sat.page.scss'],
})
// tslint:disable: no-shadowed-variable
export class GiamSatPage implements OnInit {
  @ViewChild('slides', { static: true }) slider: IonSlides;
  @ViewChildren('dashboard') dashboardComponent: QueryList<DashboardDataComponent>;
  @ViewChild (IonContent, {static: true}) content: IonContent;
  @ViewChild('gsDieuKhien') gsDieuKhien: GiamSatDieuKhienActiveComponent;

  isGoTop = false;
  dsDamTom: DamTom[] = [];
  countRPC = 0;
  countAllAlarm = 0;
  countAlarm = [];
  damtomselect: string;
  // checkCanhBao = [];
  // allCanhBao = [];
  dsGateway: Gateways[];
  check;
  segment = 0;
  interval = null;
  isLoading = false;

  // NB - toi uu giam sat
  loadedDataDamtoms: GiamSatDamTom[] = [];
  isLoadDataFinish = false;

  customActionSheetOptions: any = {
    header: 'Chọn nhà vườn',
    cssClass: 'my-custom-action-sheet',
  };

  damTomSelected: GiamSatDamTom;
  damTomSubscription: Subscription;

  intervalRem = null;
  listRpcRem: SpecialDevice[] = [];

  constructor(
    private giamsatService: GiamSatService,
    private gsServiceUpdate: GiamSatServiceUpdate,
    private dieuKhienServiceUpdate: DieuKhienServiceUpdate,
    private dieuKhienService: DieuKhienService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.loadedDataDamtoms.forEach(damtom => {
      damtom.listZoneSensor = [];
      damtom.listRpcActive = [];
    });
    // lay data tu backend luu vao local storage
    this.fetchInitDataDamtoms();
    // load data tu local storage
    this.getDataDamtomsFromLocalStorage();
    // luu data page dieu khien vao local storage
    this.storeDkDamtoms();

    // subscribe dam tom selected dk truyen di
    this.damTomSubscription = this.dieuKhienService.damTomIdSelected.subscribe(data => {
      if (data !== this.damTomSelected?.id) {
        this.damTomSelected = this.loadedDataDamtoms.find(damtom => damtom.id === data);
      }
    });
  }
  changeDamTom(damTomSelected: GiamSatDamTom) {
    this.damTomSelected = damTomSelected;
    // emit dam tom cho dk thu cong
    this.dieuKhienService.damTomIdSelected.next(damTomSelected.id);
    this.dieuKhienService.damTomId = damTomSelected.id;

    // update tb rem
    this.getSpecialDevice();
    this.startIntervalRem();
  }
  async ionViewWillEnter() {
    this.countAlarm = [];
    // NB - toi uu lai
    // update only status sensor
    this.updateDataDamToms();
    this.startInterval();
    // emit dam tom selected cho dk thu cong
    this.dieuKhienService.damTomIdSelected.next(this.damTomSelected?.id);

    // update tb rem
    this.getSpecialDevice();
    this.startIntervalRem();
  }

  getSpecialDevice() {
    this.dieuKhienService.getAllRem(this.damTomSelected?.id)?.subscribe(resData => {
      if (this.listRpcRem.length !== resData.length) {
        this.listRpcRem = resData.filter(rem => {return rem.rpcPullDevice.statusDevice == 1 || rem.rpcPushDevice.statusDevice == 1});
        this.listRpcRem.sort((rem1, rem2) => {
          // sep theo time tao moi nhat -> cu nhat
          if (rem1.createdTime > rem2.createdTime) { return -1; }
          if (rem1.createdTime < rem2.createdTime) { return 1; }
        })
      }
    });
  }

  startIntervalRem() {
    this.stopIntervalRem();

    this.intervalRem = setInterval(async () => {
      console.log('intervel rem gs');

      this.listRpcRem.forEach(rem => {
        this.getStatusRemById(rem);
      });

      this.listRpcRem = this.listRpcRem .filter(rem => {return rem.rpcPullDevice.statusDevice == 1 || rem.rpcPushDevice.statusDevice == 1});

    }, 2500);
  }

  stopIntervalRem() {
    if (!this.intervalRem) {
      return;
    }
    clearInterval(this.intervalRem);
    this.intervalRem = null;
  }

  getStatusRemById(rem: SpecialDevice) {
    this.dieuKhienService.getRemById(rem.id).pipe(
      tap(data => {
        data.pauseStatus = Number(this.caculateStatusRem(data).toFixed(0));
        
        if (data.pauseStatus > 99) {
          data.pauseStatus = 100;
        } else if (data.pauseStatus < 1) {
          data.pauseStatus = 0;
        }
        rem.pauseStatus = data.pauseStatus;
        rem.rpcPullDevice = data.rpcPullDevice;
        rem.rpcPushDevice = data.rpcPushDevice;
        rem.latestAction = data.latestAction;
        rem.latestTimeAction = data.latestTimeAction;

        console.log('getStatusRemById', data.pauseStatus);

      }),
      catchError(err => {
        return of({});
      })
    ).subscribe();
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
  

  fetchInitDataDamtoms(){
    this.gsServiceUpdate.fetchDamToms()
    .pipe(
      map(resDamtom => {
        const damTomDatas: GiamSatDamTom[] = resDamtom;
        damTomDatas.forEach(damtom => {
          // get list rpc active
          damtom.listRpcActive = this.getRpcActive(damtom);
          // get list zone sensors
          this.getZoneSensors(damtom);
        });

        damTomDatas.forEach(damtom => {
          damtom.cameras.sort((a, b) => {
              // sep theo time tao moi nhat -> cu nhat
              if (a.createdTime > b.createdTime) {
                return -1;
              }
              if (a.createdTime < b.createdTime) {
                return 1;
              }
            }
          );
        });
        return damTomDatas;
      })
    )
    .subscribe((damToms) => {
      const dataLocal = JSON.parse(localStorage.getItem('giamSatDamtoms'));
      if (dataLocal !== null) {
        if (damToms.length !== dataLocal.length){
          this.setDataDamtomsToLocalStorage(damToms);
        }
      } else {
        this.setDataDamtomsToLocalStorage(damToms);
      }
      setTimeout(() => {
        this.isLoadDataFinish = true;
      }, 5000);
    });
  }

  doRefresh(event) {
    setTimeout(() => {
      if (!!this.damTomSelected) {
        this.fetchDataDamTomById(this.damTomSelected?.id);
        this.getSpecialDevice();
        this.startIntervalRem();
      }
      event.target.complete();
    }, 2000);
  }

  fetchDataDamTomById(damtomId: string) {
    this.gsServiceUpdate.getDamTomById(damtomId)
    .pipe(
      map(resDamtom => {
        const damTomData: GiamSatDamTom = resDamtom;

        damTomData.listRpcActive = this.getRpcActive(damTomData);
        this.getZoneSensors(damTomData);

        damTomData.cameras.sort((a, b) => {
          // sep theo time tao moi nhat -> cu nhat
          if (a.createdTime > b.createdTime) {
            return -1;
          }
          if (a.createdTime < b.createdTime) {
            return 1;
          }
        });
        return damTomData;
      })
    )
    .subscribe((damTomNew) => {
      // update local storage
      const dataLocal: GiamSatDamTom[] = JSON.parse(localStorage.getItem('giamSatDamtoms'));
      if (dataLocal !== null) {
        let damtomRefresh = dataLocal.find(dt => dt.id === this.damTomSelected.id);
        damtomRefresh = damTomNew;
        this.setDataDamtomsToLocalStorage(dataLocal);
      }
      // update data tren giao dien
      if (this.damTomSelected.id === damTomNew.id) {
        // update alarms trong dam tom
        this.damTomSelected.countAlarms = damTomNew.countAlarms;
        // update name damtomSelected
        this.damTomSelected.name = damTomNew.name;
        // update rpc active
        if (damTomNew.listRpcActive.length === 0){
          this.damTomSelected.listRpcActive = [];
        } else if (damTomNew.listRpcActive.length !== this.damTomSelected.listRpcActive.length) {
          this.damTomSelected.listRpcActive = damTomNew.listRpcActive;
        } else {
          damTomNew.listRpcActive.forEach(rpcNew => {
            this.damTomSelected.listRpcActive.forEach(rpcOld => {
              if (rpcOld.id === rpcNew.id) {
                rpcOld.name = rpcNew.name;
                rpcOld.statusTime = rpcNew.statusTime;
                rpcOld.label = rpcNew.label;
                rpcOld.dftDeviceType = rpcNew.dftDeviceType;
              }
            });
          });
        }
        // update lai data telemetry cua device sensor
        if (damTomNew.listZoneSensor.length > 0){
          if (damTomNew.listZoneSensor.length !== this.damTomSelected.listZoneSensor.length) {
            this.damTomSelected.listZoneSensor = damTomNew.listZoneSensor;
          }
          // TH co 1 zone
          else if (damTomNew.listZoneSensor.length === 1
            && damTomNew.listZoneSensor[0].id !== this.damTomSelected.listZoneSensor[0].id) {
            this.damTomSelected.listZoneSensor = damTomNew.listZoneSensor;
          } else {
            damTomNew.listZoneSensor.forEach (zoneNew => {
              this.damTomSelected.listZoneSensor.forEach (zoneOld => {
                if (zoneOld.id === zoneNew.id) {
                  // truong hop list rpc moi # list rpc cu
                  if (zoneNew.listDevices.length !== zoneOld.listDevices.length) {
                    zoneOld.listDevices = zoneNew.listDevices;
                  } 
                  else {
                    zoneOld.listDevices.forEach (deviceOld => {
                      const deviceNew = zoneNew.listDevices.find(deviceUpdate => deviceUpdate.id === deviceOld.id);
                      deviceOld.lastestSensorData = deviceNew.lastestSensorData;
                      deviceOld.name = deviceNew.name;
                      deviceOld.label = deviceNew.label;
                      deviceOld.dftDeviceType = deviceNew.dftDeviceType;
                      deviceOld.telemetryType = deviceNew.telemetryType;
                      deviceOld.type = deviceNew.type;
                    });
                  }
                }
              });
            });
          }
        } else if (damTomNew.listZoneSensor.length === 0) {
          this.damTomSelected.listZoneSensor = [];
        }
        // update camera
        if (this.damTomSelected.cameras.length !== damTomNew.cameras.length) {
          this.damTomSelected.cameras = damTomNew.cameras;
        } else if (damTomNew.cameras.length === 1
          && damTomNew.cameras[0].id !== this.damTomSelected.cameras[0].id) {
          this.damTomSelected.cameras = damTomNew.cameras;
        }
        else {
          damTomNew.cameras.forEach (cameraNew => {
            this.damTomSelected.cameras.forEach (cameraOld => {
              if (cameraOld.id === cameraNew.id) {
                cameraOld.name = cameraNew.name;
                cameraOld.code = cameraNew.code;
                cameraOld.main = cameraNew.main;
                cameraOld.url = cameraNew.url;
              }
            });
          });
        }
      }
    });
  }

  setDataDamtomsToLocalStorage(giamSatDamtoms: GiamSatDamTom[]){
    const data = JSON.stringify(giamSatDamtoms);
    localStorage.setItem('giamSatDamtoms', data);
  }
  getDataDamtomsFromLocalStorage(){
    const dataDamtoms: GiamSatDamTom[] = JSON.parse(localStorage.getItem('giamSatDamtoms'));
    if (dataDamtoms !== null){
      this.loadedDataDamtoms = dataDamtoms;

      // mac dinh chon dam moi nhat
      this.damTomSelected = this.loadedDataDamtoms[0];

      // update alarm per damtom
      this.loadedDataDamtoms.forEach(damtom => {
        this.getAlarmById(damtom.id);
      });
      this.isLoadDataFinish = true;
    }
  }

  // luu lieu data cua page dieu khien vao local storage
  async storeDkDamtoms(){
    const allDamtoms = await this.dieuKhienServiceUpdate.fetchDieuKhienDamToms().toPromise();
    allDamtoms.sort((dt1, dt2) => {
      // sep theo time tao moi nhat -> cu nhat
      return dt2.createdTime - dt1.createdTime;
    });
    // luu vao storage
    this.setDataDKsToLocalStorage(allDamtoms);
  }
  setDataDKsToLocalStorage(dieuKhienDamtoms: DieuKhienDamTom[]){
    const data = JSON.stringify(dieuKhienDamtoms);
    localStorage.setItem('dieuKhienDamtoms', data);
  }

  startInterval() {
    this.stopInterval();
    this.interval = setInterval(() => {
      // NB - goi lai api load tat ca du lieu cua dam tom
      this.updateDataDamToms();
    }, 20000);
  }
  updateDataDamToms() {
    // update total number alarms
    this.getAllAlarm();
    // goi api lay data cua tat ca dam tom
    this.gsServiceUpdate.fetchDamToms()
    .pipe(
      map(resDamtom => {
        const damTomDatas: GiamSatDamTom[] = resDamtom;
        damTomDatas.forEach(damtom => {
          // get list rpc active
          damtom.listRpcActive = this.getRpcActive(damtom);

          // get list zone sensors
          this.getZoneSensors(damtom);
        });

        damTomDatas.forEach(damtom => {
          damtom.cameras.sort((a, b) => {
              // sep theo time tao moi nhat -> cu nhat
              if (a.createdTime > b.createdTime) { return -1; }
              if (a.createdTime < b.createdTime) { return 1; }
            }
          );
        });
        return damTomDatas;
      })
    )
    .subscribe(resDamToms => {
      // luu lai vao local storage
      this.setDataDamtomsToLocalStorage(resDamToms);

      if (resDamToms.length !== this.loadedDataDamtoms.length){
        this.loadedDataDamtoms = resDamToms;
        // mac dinh vao la dam tom dau tien
        this.damTomSelected = resDamToms[0];
        this.dieuKhienService.damTomId = this.damTomSelected.id;

      } else {
        resDamToms.forEach (damtomNew => {
          this.loadedDataDamtoms.forEach(damtomOld => {
            if (damtomOld.id === damtomNew.id) {
              // update name
              damtomOld.name = damtomNew.name;

              // update alarms trong dam tom
              damtomOld.countAlarms = damtomNew.countAlarms;

              // update rpc active
              if (damtomNew.listRpcActive.length === 0){
                damtomOld.listRpcActive = [];
              } else if (damtomNew.listRpcActive.length !== damtomOld.listRpcActive.length) {
                damtomOld.listRpcActive = damtomNew.listRpcActive;
              } else {
                damtomNew.listRpcActive.forEach(rpcNew => {
                  damtomOld.listRpcActive.forEach(rpcOld => {
                    if (rpcOld.id === rpcNew.id) {
                      rpcOld.name = rpcNew.name;
                      rpcOld.statusTime = rpcNew.statusTime;
                      rpcOld.label = rpcNew.label;
                      rpcOld.dftDeviceType = rpcNew.dftDeviceType;
                    }
                  });
                });
              }

              // update lai data telemetry cua device sensor
              if (damtomNew.listZoneSensor.length > 0){
                if (damtomNew.listZoneSensor.length !== damtomOld.listZoneSensor.length) {
                  damtomOld.listZoneSensor = damtomNew.listZoneSensor;
                }
                // TH co 1 zone
                else if (damtomNew.listZoneSensor.length === 1 && damtomNew.listZoneSensor[0]?.id !== damtomOld.listZoneSensor[0]?.id) {
                  damtomOld.listZoneSensor = damtomNew.listZoneSensor;
                }
                else {
                  damtomNew.listZoneSensor.forEach (zoneNew => {
                    damtomOld.listZoneSensor.forEach (zoneOld => {
                      if (zoneOld.id === zoneNew.id) {
                        // update ten zone
                        zoneOld.name = zoneNew.name;

                        // truong hop list rpc moi # list rpc cu
                        if (zoneNew.listDevices.length !== zoneOld.listDevices.length) {
                          zoneOld.listDevices = zoneNew.listDevices;
                        } 
                        else {
                          zoneOld.listDevices.forEach (deviceOld => {
                            const deviceNew = zoneNew.listDevices.find(deviceUpdate => deviceUpdate.id === deviceOld.id);
                            deviceOld.lastestSensorData = deviceNew.lastestSensorData;
                            deviceOld.name = deviceNew.name;
                            deviceOld.label = deviceNew.label;
                            deviceOld.dftDeviceType = deviceNew.dftDeviceType;
                            deviceOld.telemetryType = deviceNew.telemetryType;
                            deviceOld.type = deviceNew.type;
                          });
                        }
                      }
                    });
                  });
                }
              } else if (damtomNew.listZoneSensor.length === 0) {
                damtomOld.listZoneSensor = [];
              }
              // update camera
              if (damtomOld.cameras.length !== damtomNew.cameras.length) {
                damtomOld.cameras = damtomNew.cameras;
              } 
              // TH xoa 1 cam roi them lai 1 cam moi
              else if (damtomNew.cameras.length === 1
                && damtomNew.cameras[0].id !== damtomOld.cameras[0].id) {
                  damtomOld.cameras = damtomNew.cameras;
              } else {
                damtomNew.cameras.forEach (cameraNew => {
                  damtomOld.cameras.forEach (cameraOld => {
                    if (cameraOld.id === cameraNew.id) {
                      cameraOld.name = cameraNew.name;
                      cameraOld.code = cameraNew.code;
                      cameraOld.main = cameraNew.main;
                      cameraOld.url = cameraNew.url;
                    }
                  });
                });
              }
            }
          });
        });
      }


    });
  }
  getRpcActive(damTom: GiamSatDamTom){
    const listRpcActive = [];
    if (damTom.listZones.length >= 1) {
      damTom.listZones.forEach(zone => {
        zone.listDevices.forEach(device => {
          if (device.type === DeviceType.RPC && device.rpcStatus === 1 && device.dftDeviceType !== 'REM') {
            listRpcActive.push(device);
          }
        });
      });
    }
    listRpcActive.sort((a, b) => {
      // sep theo time tao moi nhat -> cu nhat
      if (a.createdTime > b.createdTime) { return -1; }
      if (a.createdTime < b.createdTime) { return 1; }
    });
    return listRpcActive;
  }
  getZoneSensors(damTom: GiamSatDamTom){
    const listZoneSensor = [];
    if (damTom.listZones.length >= 1){
      damTom.listZones.forEach(zone => {
        if (zone.listDevices.length >= 1){
          const zoneEntity: Zone = {
            id: zone.id,
            name: zone.name,
            listDevices: zone.listDevices.filter(device => {
              return device.type !== DeviceType.RPC;
            }).map((device) => {
              let lastestData;
              // neu ts tra ve < 5 phut so voi thoi diem hien tai -> mat ket noi
              if (device.lastestSensorData.ts < (moment().valueOf() - 120000)) {
                lastestData = {
                  alarm: false,
                  ts: null,
                  value: null,
                  nguongViPham: null
                };
              } else {
                if (device.dftDeviceType === 'CAMBIEN_ANHSANG') {
                  lastestData = {
                    ts: device.lastestSensorData.ts,
                    alarm: device.lastestSensorData.alarm,
                    value: Math.round(device.lastestSensorData.value),
                    nguongViPham: device.lastestSensorData.nguongViPham
                  };
                } else {
                  lastestData = {
                    ts: device.lastestSensorData.ts,
                    alarm: device.lastestSensorData.alarm,
                    value: Number((device.lastestSensorData.value).toFixed(1)),
                    nguongViPham: device.lastestSensorData.nguongViPham
                  };
                }
              }
              return {
                ...device,
                lastestSensorData: lastestData,
                order: device.telemetryType === TelemetryType.TEMPERATURE ? 1 :
                  device.telemetryType === TelemetryType.HUMIDITY ? 2 :
                    device.telemetryType === TelemetryType.LUX ? 3 : 4,
              };
            })
          };
          if (zoneEntity.listDevices.length > 0) {
            zoneEntity.listDevices.sort((a, b) => {
              // sep theo thu tu tang dan nhiet do - do am - anh sang
              if (a.order > b.order) { return 1; }
              if (a.order < b.order) { return -1; }
              // sep theo time tao moi nhat -> cu nhat
              if (a.createdTime > b.createdTime) { return -1; }
              if (a.createdTime < b.createdTime) { return 1; }
            });
            listZoneSensor.push(zoneEntity);
          }
        }
      });
      damTom.listZoneSensor = listZoneSensor;
    }
  }


  // Lay tat ca canh bao
  getAllAlarm() {
    this.giamsatService.CountAlarmByDamTom().subscribe((data) => {
      if (this.countAllAlarm !== data){
        this.countAllAlarm = data;
      }
    });
  }
  // Lay canh bao theo dam
  getAlarmById(damTomId: string) {
    this.giamsatService.CountAlarmByDamTom(damTomId).subscribe((data) => {
      const rs = {
        idDam: damTomId,
        countAlarm: data,
      };
      this.countAlarm.push(rs);
    });
  }

  ionViewWillLeave() {
    // console.log('view will leave');

    // this.check = 0;
    // this.checkCanhBao = [];
    clearInterval(this.interval);
    this.interval = null;

    this.stopInterval();

    this.stopIntervalRem();

    // this.dashboardComponent.forEach(data => {
      // data.ionViewWillLeave();
    // });
  }

  stopInterval() {
    if (!this.interval) {
      return;
    }
    clearInterval(this.interval);
    this.interval = null;
  }

  async fetchData() {
    const data = await this.giamsatService.getDanhSachDamTom().toPromise();
    // trungdt - kiểm tra nếu dữ liệu thay đổi thì mới cập nhật
    // trungdt - bỏ dữ liệu của gateways để so sánh vì dữ liệu này thay đổi liên tục
    const checkArray1 = data.map((el) => ({ ...el, gateways: [] }));
    const checkArray2 = this.dsDamTom.map((el) => ({ ...el, gateways: [] }));

    if (!arrayEqual(checkArray1, checkArray2)) {
      this.dsDamTom = data;
    }

    const newCountAlarm = [];
    let newAllCount = 0;
    // trungdt - lấy dữ liệu cảnh báo của đầm tôm
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.dsDamTom.length; i++) {
      const data = await this.giamsatService.CountAlarmByDamTom(this.dsDamTom[i].id).toPromise();
      newCountAlarm.push({
        idDam: this.dsDamTom[i].id,
        countAlarm: data,
      });
      newAllCount += data;
    }

    this.countAlarm = newCountAlarm;
    this.countAllAlarm = newAllCount;
  }

  // btn scroll top
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
}