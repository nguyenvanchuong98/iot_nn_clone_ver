import { DieuKhienService } from 'src/app/core/services/dieu-khien.service';
import { GiamSatService } from 'src/app/core/services/giam-sat.service';
import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { QuanLyZoneService } from '../../../../core/services/quan-ly-zone.service';
import { DeviceType, GiamSatDamTom, GiamSatDevice, TelemetryType, Zone } from '../giam-sat-update.model';
import { GiamSatServiceUpdate } from '../giam-sat-update.service';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-data',
  templateUrl: './dashboard-data.component.html',
  styleUrls: ['./dashboard-data.component.scss'],
})
export class DashboardDataComponent implements OnInit {
  // protected ngUnsubscribe: Subject<void> = new Subject<void>();
  @Input() damTom: GiamSatDamTom;
  @Input() listRpcActiveNew: GiamSatDevice[] = [];
  @Input() listZoneSensorNew: Zone[] = [];

  // listRPC: DeviceRpc[] = [];
  // RpcList: DeviceRpc[] = [];
  // countRPC = 0;
  // listCam;
  // dsGateway;
  // damCanhBao;
  // listTelemetry = [];
  // dashBoardData = [];
  // idDamCanhBao = [];
  // checkCanhBao1;
  // checkCanhBao = [];
  // allCanhBao = [];
  // listDevice: Device[] = [];
  // tenDamTom;
  // segment = 0;
  intervaldb = null;
  isLoading = false;
  // listAllZone: Zone[] = [];
  // listDeviceInZone: DeviceInZone[] = [];
  // listDeviceNotInZone: Device[] = [];

  // trungdt - cấu trúc lại code
  // listDeviceFix: Device[] = [];
  // listZones: Zone[] = [];

  // NB - toi uu giam sat
  listRpcActive: GiamSatDevice[] = [];
  listZoneSensor: Zone[] = [];

  telemetryIcons = {
    Temperature: {
      nomal: 'assets/images/temperature.png',
      disconnected: 'assets/images/temperature_gray.png',
      alarm: 'assets/images/temperature_red.png',
      unit: '°C'
    },
    Humidity: {
      nomal: 'assets/images/humid.png',
      disconnected: 'assets/images/humid_grey.png',
      alarm: 'assets/images/humid_red.png',
      unit: '%'
    },
    Lux: {
      nomal: 'assets/images/lux.png',
      disconnected: 'assets/images/lux_grey.png',
      alarm: 'assets/images/lux_red.png',
      unit: 'lux'
    },
  };

  constructor(

    public giamsatService: GiamSatService,
    public dieuKhienService: DieuKhienService,
    public quanLyZoneService: QuanLyZoneService,
    public gsServiceUpdate: GiamSatServiceUpdate
    // private activatedRoute: ActivatedRoute,
  ) {
    // this.activatedRoute.queryParams.subscribe(params => {
    //   console.log('querry');
    //   this.damTom = params.damTom;
    // });
  }

  ngOnInit() {
    // this.isLoading = true;
    // this.dashBoadData();

    // trungdt - cấu trúc lại code
    // this.onViewEnter();

    // //NB - toi uu giam sat
    this.fetchZoneSensor();
  }

  // khi page giam sat goi api load lai data -> input change -> se goi ham nay
  // tslint:disable-next-line: use-lifecycle-interface
  ngOnChanges(){
    // //NB - toi uu giam sat
    // update lai rpc active
    if (this.listRpcActive.length === 0 || this.listRpcActiveNew.length === 0){
      this.listRpcActive = this.listRpcActiveNew;
    } else if (this.listRpcActiveNew.length !== this.listRpcActive.length) {
      this.listRpcActive = this.listRpcActiveNew;
    } else {
      this.listRpcActiveNew.forEach(rpcNew => {
        this.listRpcActive.forEach(rpcOld => {
          if (rpcOld.id === rpcNew.id) {
            rpcOld = rpcNew;
            // console.log('rpc old',rpcOld);
          }
        });
      });
    }

    // update lai data telemetry cua device sensor
    if (this.listZoneSensorNew.length > 0 && this.listZoneSensor.length > 0){
      if (this.listZoneSensorNew.length !== this.listZoneSensor.length) {
        this.listZoneSensor = this.listZoneSensorNew;
      } else {
        this.listZoneSensorNew.forEach (zoneNew => {
          this.listZoneSensor.forEach (zoneOld => {
            if (zoneOld.id === zoneNew.id) {
              // truong hop list rpc moi # list rpc cu
              if (zoneNew.listDevices.length !== zoneOld.listDevices.length) {
                zoneOld.listDevices = zoneNew.listDevices;
              } else {
                zoneOld.listDevices.forEach (device => {
                  const deviceNew = zoneNew.listDevices.find(deviceUpdate => deviceUpdate.id === device.id);
                  device.lastestSensorData = deviceNew.lastestSensorData;
                  // console.log(deviceNew.lastestSensorData);
                });
              }
            }
          });
        });
      }
    }
  }
  fetchRpcActive() {
    if (this.damTom.listZones.length >= 1) {
      this.damTom.listZones.forEach(zone => {
        zone.listDevices.forEach(device => {
          if (device.type === DeviceType.RPC && device.rpcStatus === 1) {
            this.listRpcActive.push(device);
          }
        });
      });
    }
  }

  fetchZoneSensor(){
    if (this.damTom.listZones.length >= 1){
      this.damTom.listZones.forEach(zone => {
        if (zone.listDevices.length >= 1){
          const zoneEntity: Zone = {
            id: zone.id,
            name: zone.name,
            listDevices: zone.listDevices.filter(device => {
              return device.type === DeviceType.SENSOR;
            }).map((device) => {
              let lastestData;
              // neu ts tra ve < 5 phut so voi thoi diem hien tai -> mat ket noi
              if (device.lastestSensorData.ts < (moment().valueOf() - 300000)) {
                lastestData = {
                  alarm: false,
                  ts: null,
                  value: null
                };
              } else {
                lastestData = {
                  ts: device.lastestSensorData.ts,
                  alarm: device.lastestSensorData.alarm,
                  value: Number((device.lastestSensorData.value).toFixed(1)),
                };
              }
              return {
                ...device,
                lastestSensorData: lastestData,
                order: device.telemetryType === TelemetryType.TEMPERATURE ? 1 :
                  device.telemetryType === TelemetryType.HUMIDITY ? 2 :
                    device.telemetryType === TelemetryType.LUX ? 3 : '',
              };
            })
          };
          if (zoneEntity.listDevices.length > 0) {
            zoneEntity.listDevices.sort((a, b) => {
              // sep theo thu tu nhiet do - do am - anh sang
              if (a.order > b.order) { return 1; }
              if (a.order < b.order) { return -1; }
              // sep theo time tao moi nhat -> cu nhat
              if (a.createdTime > b.createdTime) { return -1; }
              if (a.createdTime < b.createdTime) { return 1; }
            });
            this.listZoneSensor.push(zoneEntity);
          }
        }
      });
    }
  }


  // startInterval() {
  //   this.stopInterval();

  //   this.intervaldb = setInterval(() => {
  //     // this.fetchData();
  //     // this.fetchAllDataDomTom();
  //   }, 10000);
  // }

  // stopInterval() {
  //   if (!this.intervaldb) {
  //     return;
  //   }
  //   clearInterval(this.intervaldb);
  //   this.intervaldb = null;
  // }

  // trungdt - call khi page cha active
  onViewEnter() {
    // this.fetchData();
    // this.fetchAllDataDomTom();

    // this.startInterval();
  }

  // ionViewWillLeave() {
    // this.stopInterval();
  // }

  // getZoneSensor() {
  //   //lấy zone có chứa sensor device
  //   const newArr = [];

  //   this.damTom.listZones.forEach(zone => {
  //     if (zone.listDevices.length >= 1) {
  //       const zoneEntity: Zone = {
  //         id: zone.id,
  //         name: zone.name,
  //         listDevices: zone.listDevices.filter(device => {
  //           return device.type === DeviceType.SENSOR;
  //         }).map((device) => {
  //           let lastestData;
  //           //neu ts tra ve < 5 phut so voi thoi diem hien tai -> mat ket noi
  //           if (device.lastestSensorData.ts < (moment().valueOf() - 300000)) {
  //             lastestData = {
  //               alarm: false,
  //               ts: null,
  //               value: null
  //             }
  //           } else {
  //             lastestData = {
  //               ts: device.lastestSensorData.ts,
  //               alarm: device.lastestSensorData.alarm,
  //               value: Number((device.lastestSensorData.value).toFixed(1)),
  //             }
  //           }
  //           return {
  //             id: device.id,
  //             name: device.name,
  //             label: device.label,
  //             type: device.type,
  //             telemetryType: device.telemetryType,
  //             rpcStatus: device.rpcStatus,
  //             statusTime: device.statusTime,
  //             lastestSensorData: lastestData,
  //             createdTime: device.createdTime,
  //             order: device.telemetryType === TelemetryType.TEMPERATURE ? 1 :
  //               device.telemetryType === TelemetryType.HUMIDITY ? 2 :
  //                 device.telemetryType === TelemetryType.LUX ? 3 : '',
  //           }
  //         })
  //       }

  //       if (zoneEntity.listDevices.length > 0) {
  //         zoneEntity.listDevices.sort((a, b) => {
  //           //sep theo thu tu nhiet do - do am - anh sang
  //           if (a.order > b.order) return 1;
  //           if (a.order < b.order) return -1;
  //           //sep theo time tao moi nhat -> cu nhat
  //           if (a.createdTime > b.createdTime) return -1;
  //           if (a.createdTime < b.createdTime) return 1;
  //         })
  //         newArr.push(zoneEntity);
  //       }
  //     }
  //   })
  //   this.listZoneSensor = newArr;
  // }

  // async fetchData() {
  //   if (this.damTom?.gateways?.length == 0) {
  //     return;
  //   }
  //
  //   const dsGW = this.damTom.gateways
  //     .sort((a, b) => a.createdTime - b.createdTime)
  //     .filter((el) => el.active);
  //
  //   let newData: Device[] = [];
  //
  //   // trungdt - lấy dữ liệu devices từ gateways
  //   for (let i = 0; i < dsGW.length; i++) {
  //     const devices = await this.getGatewayDevices(dsGW[i].id, dsGW[i].device.id);
  //     newData = newData.concat(devices);
  //   }
  //
  //   for (let i = 0; i < newData.length; i++) {
  //     // trungdt - lấy dữ liệu trạng thái của rpc
  //     if (newData[i].type === DeviceType.RPC) {
  //       const deviceName = newData[i].deviceName;
  //
  //       const data = await this.dieuKhienService.getLastestStatusDevice(newData[i].deviceId, newData[i].deviceName).toPromise();
  //
  //       //get status time của rpc active
  //       let dataRpc = await this.dieuKhienService.getAllRpcDevice(this.damTom.id).toPromise();
  //
  //       if (!data[deviceName] || !data[deviceName][0]) {
  //         continue;
  //       }
  //       // trungdt - data[deviceName][0].ts = thời gian update dữ liệu cuối cùng
  //       // nếu trong vòng 60s trạng thái thiết bị ko dc update -> được tính là mất kết nối status = -1
  //       newData[i].statusDevice = data[deviceName][0].ts > moment().valueOf() - 60000 ? parseInt(data[deviceName][0].value, 10) : -1;
  //
  //       dataRpc.forEach(data => {
  //         newData[i].statusTime = data.statusTime;
  //       });
  //
  //       continue;
  //     }
  //
  //     // trungdt - lấy dữ liệu telemetry mới nhất của sensor
  //     if (newData[i].type === DeviceType.SENSOR) {
  //
  //       const data = await this.giamsatService.getLastestTelemetry(newData[i].deviceId).toPromise();
  //
  //       const telemetryData = data[newData[i].telemetryType];
  //
  //       if (!telemetryData) { continue; }
  //
  //       telemetryData.forEach((el) => {
  //         if (el.deviceId !== newData[i].deviceId) {
  //           return;
  //         }
  //
  //         newData[i].telemetryData = {
  //           alarm: false,
  //           ts: null,
  //           value: null
  //         };
  //
  //         if (el.ts < (moment().valueOf() - 300000)) { return; }
  //
  //         newData[i].telemetryData = {
  //           alarm: el.alarm,
  //           ts: el.ts,
  //           value: (el.value).toFixed(1)
  //         };
  //       });
  //
  //       continue;
  //     }
  //   }
  //
  //   // trungdt - lấy dữ liệu thiết bị ở zone nào
  //   const zones = await this.giamsatService.getListSensorDeviceZone(this.damTom.id).toPromise();
  //   this.listZones = zones;
  //
  //   //sort zone theo thu tu user sap xep
  //   const indexOfZone = await this.quanLyZoneService.getIndexOfZone(this.damTom.id).toPromise();
  //
  //   this.listZones = this.listZones.map((zone)=>{
  //     return{
  //       ...zone,
  //       index: indexOfZone.zoneIds.findIndex(zoneId=>{
  //         return zone.id === zoneId
  //       })
  //     }
  //   });
  //   this.listZones.sort((a,b)=>{
  //     return a.index - b.index;
  //   })
  //
  //   // trungdt - duyệt danh sách devices trong zone để lấy zone id cho listDeviceFix
  //   this.listZones.forEach((zone) => {
  //     zone.deviceEntityList.forEach((zoneDevice) => {
  //       newData.forEach((device) => {
  //         if (device.deviceId !== zoneDevice.id) { return; }
  //         device.zoneId = zone.id;
  //       })
  //     })
  //   })
  //
  //   this.listDeviceFix = newData;
  // }
  //
  // async getGatewayDevices(gatewayId: string, gatewayDeviceId: string): Promise<Device[]> {
  //   const data = await this.giamsatService.getDamTomGateWay(gatewayId).toPromise();
  //   if (!data || !data.listDevices) { return []; }
  //
  //   return data.listDevices?.map((el) => {
  //     const check = el.name.toLowerCase();
  //     return {
  //       type: check.includes('temp') || check.includes('humidity') || check.includes('lux') ? DeviceType.SENSOR : DeviceType.RPC,
  // tslint:disable-next-line: max-line-length
  //       telemetryType: check.includes('temp') ? TelemetryType.TEMPERATURE : (check.includes('humidity') ? TelemetryType.HUMIDITY : (check.includes('lux') ? TelemetryType.LUX : '')),
  //       damTomId: this.damTom.id,
  //       gatewayId: gatewayDeviceId,
  //       deviceId: el.id,
  //       deviceLabel: el.label,
  //       deviceName: el.name,
  //       dataDevice: [],
  //       telemetryData: {
  //         value: null,
  //         ts: null,
  //         alarm: false
  //       },
  //       order: check.includes('temp') ? 1 : (check.includes('humidity') ? 2 : (check.includes('lux') ? 3 : '')),
  //       createdTime: el.createdTime
  //     };
  //   });
  // }
  //
  // getSensorDevicesNotInZone(): Device[] {
  //   return this.listDeviceFix.filter((el) => !el.zoneId && el.type === DeviceType.SENSOR)
  //       .sort((a,b)=> {
  //         //sep theo thu tu nhiet do - do am - anh sang
  //         if(a.order > b.order) return 1;
  //         if(a.order < b.order) return -1;
  //         //sep theo time tao moi nhat -> cu nhat
  //         if(a.createdTime > b.createdTime) return -1;
  //         if(a.createdTime < b.createdTime) return 1;
  //       });
  // }
  //
  // getSensorDevicesInZones(zoneId) {
  //   return this.listDeviceFix.filter((el) => el.zoneId === zoneId && el.type === DeviceType.SENSOR)
  //       .sort((a,b)=> {
  //         //sep theo thu tu nhiet do - do am - anh sang
  //         if(a.order > b.order) return 1;
  //         if(a.order < b.order) return -1;
  //         //sep theo time tao moi nhat -> cu nhat
  //         if(a.createdTime > b.createdTime) return -1;
  //         if(a.createdTime < b.createdTime) return 1;
  //       });
  // }
  //
  // getActiveRpcDevices() {
  //   return this.listDeviceFix.filter((el) => el.type === DeviceType.RPC && el.statusDevice === 1);
  // }

  // async fetchAllDataDomTom() {
  //   const dataDamTom = await this.giamsatService.getAllDataDamTom(this.damTom.id).toPromise();

  //   const listCam = dataDamTom.cameras.map(camera => {
  //     return {
  //       code: camera.code,
  //       name: camera.name,
  //       createdTime: camera.createdTime,
  //       id: camera.id,
  //       main: camera.main,
  //       url: camera.url,
  //     };
  //   })
  //   this.dataDamtom = {
  //     active: dataDamTom.active,
  //     address: dataDamTom.address,
  //     cameras: listCam.sort((a, b) => {
  //       //sep theo time tao moi nhat -> cu nhat
  //       if (a.createdTime > b.createdTime) return -1;
  //       if (a.createdTime < b.createdTime) return 1;
  //     }),
  //     createdBy: dataDamTom.createdBy,
  //     createdTime: dataDamTom.createdTime,
  //     listZones: dataDamTom.listZones,
  //     id: dataDamTom.id,
  //     images: dataDamTom.images,
  //     name: dataDamTom.name,
  //     note: dataDamTom.note,
  //     searchText: dataDamTom.searchText,
  //     staffs: dataDamTom.staffs,
  //     tenantId: dataDamTom.tenantId,
  //     countAlarms: dataDamTom.countAlarms,
  //   };

  //   this.getRpcActive();
  //   this.getZoneSensor();
  // }


  // async dashBoadData() {
  //   console.log('dashBoadData ----------- ');
  //   if (!this.damTom?.gateways || (!!this.damTom?.gateways && this.damTom?.gateways.length < 1)) {
  //     this.isLoading = false;
  //     return;
  //   }
  //   const dsGW = this.damTom.gateways.sort(
  //     (a, b) => a.createdTime - b.createdTime
  //   );
  //   // this.listCam = this.da.cameras;
  //   this.dsGateway = dsGW.filter((dsGW) => dsGW.active === true);
  //   if (!!this.dsGateway && this.dsGateway.length > 0) {
  //     this.dsGateway.forEach((data) => {
  //       this.getDataDashBoard(data.id, data.device.id);
  //     });
  //     this.getAllThietBiDieuKhien(this.damTom.id);

  //     this.startInterval();
  //     console.log('----------------------92', this.intervaldb);
  //   }
  //   this.getListDeviceZone(this.damTom.id);
  // }

  // async getAllThietBiDieuKhien(damTomId: string) {
  //   const data = await this.dieuKhienService.getAllRpcDevice(damTomId).toPromise();
  //   if (data !== null && data !== undefined) {
  //     this.listRPC = data;
  //     console.log('this.listRPC ------------ ', this.listRPC);
  //     this.listRPC.forEach((rpc) => {
  //       this.getStatusDevice(rpc.deviceId, rpc.tenThietBi);
  //     });
  //   }
  // }

  // async getStatusDevice(deviceId: string, deviceName: string) {
  //   const data = await this.dieuKhienService.getLastestStatusDevice(deviceId, deviceName).toPromise();
  //   this.listRPC.forEach((deviceRpc) => {
  //     if (deviceRpc.deviceId === deviceId) {
  //       if (
  //         data[deviceName][0].value !== null &&
  //         data[deviceName][0].value !== undefined
  //       ) {
  //         if (data[deviceName][0].ts > moment().valueOf() - 60000) {
  //           deviceRpc.statusDevice = parseInt(
  //             data[deviceName][0].value,
  //             10
  //           );
  //           if (deviceRpc.statusDevice === 1) {
  //             this.countRPC++;
  //           }
  //         } else {
  //           deviceRpc.statusDevice = -1;
  //         }
  //       }
  //     }
  //   });
  // }

  // getDataDashBoard(gatewayId: string, realgatewayId: string) {
  //   this.giamsatService.getDamTomGateWay(gatewayId).subscribe((data: any) => {
  //     if (data !== null && data !== undefined) {
  //       const list = data.listDevices;
  //       list.forEach((data) => {
  //         const check = data.name.toLowerCase();
  //         if (
  //           // check.includes('ph') ||
  //           check.includes('temp') ||
  //           check.includes('humidity') ||
  //           check.includes('lux')
  //         ) {
  //           const rs: Device = {
  //             gatewayId: realgatewayId,
  //             deviceId: data.id,
  //             deviceLabel: data.label,
  //             deviceName: data.name,
  //             dataDevice: [],
  //           };
  //           this.listDevice.push(rs);
  //         }
  //       });
  //       this.listDevice.forEach((data: any) => {
  //         if (data !== null && data !== undefined) {
  //           this.getLastestTelemetry(data.gatewayId, data.deviceId);
  //         }
  //       });
  //       this.isLoading = false;
  //     }
  //     else {
  //       this.isLoading = false;
  //     }
  //   });
  // }
  // getListDeviceZone(damTomId?: string) {
  //   this.giamsatService.getListSensorDeviceZone(damTomId).subscribe((response) => {
  //     //response tra ve 1 mang cac object zone
  //     if (response.length > 0) {
  //       let deviceInEachZone: DeviceInZone[] = [];

  //       response.forEach(zone => {
  //         console.log(zone.deviceEntityList);
  //         deviceInEachZone = [];
  //         zone.deviceEntityList.forEach(device => {
  //           if (device.name.toLowerCase().includes('temp') ||
  //             device.name.toLowerCase().includes('humidity') ||
  //             device.name.toLowerCase().includes('lux')) {
  //             const deviceInZone: DeviceInZone = {
  //               id: device.id,
  //               name: device.name,
  //               label: device.label,
  //               dataDevice: [],
  //             };
  //             this.listDeviceInZone.push(deviceInZone);
  //             deviceInEachZone.push(deviceInZone);
  //           }
  //         })
  //         const zoneEntity: Zone = {
  //           nameZone: zone.name,
  //           device: deviceInEachZone,
  //         }
  //         this.listAllZone.push(zoneEntity);
  //       })

  //       // trungdt - lưu dữ liệu zones vào localstorage
  //       this.giamsatService.cacheDamTomZones(damTomId, this.listAllZone);

  //       console.log('list device in zone: ======= 210', this.listDeviceInZone)
  //       console.log('list zone: ======= 211', this.listAllZone)
  //     }
  //     else if (response.length == 0) {
  //       this.getDeviceNotInZone();
  //     }
  //     if (this.listDeviceInZone.length > 0) {
  //       this.getDeviceNotInZone();
  //     }
  //   }, errRes => {
  //     console.log('error get list zone 193', errRes)
  //   })
  // }
  // getDeviceNotInZone() {
  //   console.log('========= tat ca device', this.listDevice);
  //   console.log('========= device trong zone', this.listDeviceInZone);
  //   this.listDeviceNotInZone = [];
  //   this.listDevice.forEach((device, index) => {
  //     if (this.listDeviceInZone.find(e => { return e.id == device.deviceId }) == undefined) {
  //       this.listDeviceNotInZone.push(device);
  //     } else if (this.listAllZone.length == 0) {
  //       this.listDeviceNotInZone.push(device);
  //     }
  //   });
  //   console.log('device khong co trong zone nao ======= 215', this.listDeviceNotInZone);
  // }
  // getLastestTelemetry(gatewayId: string, deviceId: string) {
  //   this.giamsatService
  //     .getLastestTelemetry(gatewayId).subscribe((data: any) => {
  //       if (data !== null && data !== undefined) {
  //         this.listDevice.forEach(element => {
  //           if (element.deviceId === deviceId) {
  //             if (element.deviceName.toLowerCase().includes('temp')) {
  //               if (!!data.Temperature[0] && data.Temperature[0].ts > (moment().valueOf() - 300000)) {
  //                 let check = 0;
  //                 element.dataDevice.forEach(e => {
  //                   if (e.key === 'Temperature') {
  //                     check = 1;
  //                     e.value = (data.Temperature[0].value).toFixed(1);
  //                     e.ts = data.Temperature[0].ts;
  //                     e.alarm = data.Temperature[0].alarm;
  //                   }
  //                 });
  //                 if (check === 0) {
  //                   const dataTemp = {
  //                     key: 'Temperature',
  //                     alarm: data.Temperature[0].alarm,
  //                     ts: data.Temperature[0].ts,
  //                     value: (data.Temperature[0].value).toFixed(1)
  //                   };
  //                   element.dataDevice.push(dataTemp);
  //                 }
  //               }
  //               else {
  //                 let check = 0;
  //                 element.dataDevice.forEach(e => {
  //                   if (e.key === 'Temperature') {
  //                     check = 1;
  //                     e.value = null;
  //                     e.ts = null;
  //                     e.alarm = false;
  //                   }
  //                 });
  //                 if (check === 0) {
  //                   const dataSal = {
  //                     key: 'Temperature',
  //                     alarm: false,
  //                     ts: null,
  //                     value: null
  //                   };
  //                   element.dataDevice.push(dataSal);
  //                 }
  //               }
  //             }
  //             if (element.deviceName.toLowerCase().includes('lux')) {
  //               if (!!data.Lux[0] && data.Lux[0].ts > (moment().valueOf() - 300000)) {
  //                 let check = 0;
  //                 element.dataDevice.forEach(e => {
  //                   if (e.key === 'Lux') {
  //                     check = 1;
  //                     e.value = (data.Lux[0].value).toFixed(1);
  //                     e.ts = data.Lux[0].ts;
  //                     e.alarm = data.Lux[0].alarm;
  //                   }
  //                 });
  //                 if (check === 0) {
  //                   const dataSal = {
  //                     key: 'Lux',
  //                     alarm: data.Lux[0].alarm,
  //                     ts: data.Lux[0].ts,
  //                     value: (data.Lux[0].value).toFixed(1)
  //                   };
  //                   element.dataDevice.push(dataSal);
  //                 }
  //               }
  //               else {
  //                 let check = 0;
  //                 element.dataDevice.forEach(e => {
  //                   if (e.key === 'Lux') {
  //                     check = 1;
  //                     e.value = null;
  //                     e.ts = null;
  //                     e.alarm = false;
  //                   }
  //                 });
  //                 if (check === 0) {
  //                   const dataSal = {
  //                     key: 'Lux',
  //                     alarm: false,
  //                     ts: null,
  //                     value: null
  //                   };
  //                   element.dataDevice.push(dataSal);
  //                 }
  //               }
  //             }
  //             if (element.deviceName.toLowerCase().includes('humidity')) {

  //               if (!!data.Humidity[0] && data.Humidity[0].ts > (moment().valueOf() - 300000)) {
  //                 let check = 0;
  //                 element.dataDevice.forEach(e => {
  //                   if (e.key === 'Humidity') {
  //                     check = 1;
  //                     e.value = (data.Humidity[0].value).toFixed(1);
  //                     e.ts = data.Humidity[0].ts;
  //                     e.alarm = data.Humidity[0].alarm;
  //                   }
  //                 });
  //                 if (check === 0) {
  //                   const dataDO = {
  //                     key: 'Humidity',
  //                     alarm: data.Humidity[0].alarm,
  //                     ts: data.Humidity[0].ts,
  //                     value: (data.Humidity[0].value).toFixed(1)
  //                   };
  //                   element.dataDevice.push(dataDO);
  //                 }
  //               }
  //               else {
  //                 let check = 0;
  //                 element.dataDevice.forEach(e => {
  //                   if (e.key === 'Humidity') {
  //                     check = 1;
  //                     e.value = null;
  //                     e.ts = null;
  //                     e.alarm = false;
  //                   }
  //                 });
  //                 if (check === 0) {
  //                   const dataSal = {
  //                     key: 'Humidity',
  //                     alarm: false,
  //                     ts: null,
  //                     value: null
  //                   };
  //                   element.dataDevice.push(dataSal);
  //                 }
  //               }
  //             }
  //           }
  //         });
  //         this.listDeviceInZone.forEach(element => {
  //           if (element.id === deviceId) {
  //             if (element.name.toLowerCase().includes('temp')) {
  //               if (!!data.Temperature[0] && data.Temperature[0].ts > (moment().valueOf() - 300000)) {
  //                 let check = 0;
  //                 element.dataDevice.forEach(e => {
  //                   if (e.key === 'Temperature') {
  //                     check = 1;
  //                     e.value = (data.Temperature[0].value).toFixed(1);
  //                     e.ts = data.Temperature[0].ts;
  //                     e.alarm = data.Temperature[0].alarm;
  //                   }
  //                 });
  //                 if (check === 0) {
  //                   const dataTemp = {
  //                     key: 'Temperature',
  //                     alarm: data.Temperature[0].alarm,
  //                     ts: data.Temperature[0].ts,
  //                     value: (data.Temperature[0].value).toFixed(1)
  //                   };
  //                   element.dataDevice.push(dataTemp);
  //                 }
  //               }
  //               else {
  //                 let check = 0;
  //                 element.dataDevice.forEach(e => {
  //                   if (e.key === 'Temperature') {
  //                     check = 1;
  //                     e.value = null;
  //                     e.ts = null;
  //                     e.alarm = false;
  //                   }
  //                 });
  //                 if (check === 0) {
  //                   const dataSal = {
  //                     key: 'Temperature',
  //                     alarm: false,
  //                     ts: null,
  //                     value: null
  //                   };
  //                   element.dataDevice.push(dataSal);
  //                 }
  //               }
  //             }
  //             if (element.name.toLowerCase().includes('lux')) {
  //               if (!!data.Lux[0] && data.Lux[0].ts > (moment().valueOf() - 300000)) {
  //                 let check = 0;
  //                 element.dataDevice.forEach(e => {
  //                   if (e.key === 'Lux') {
  //                     check = 1;
  //                     e.value = (data.Lux[0].value).toFixed(1);
  //                     e.ts = data.Lux[0].ts;
  //                     e.alarm = data.Lux[0].alarm;
  //                   }
  //                 });
  //                 if (check === 0) {
  //                   const dataSal = {
  //                     key: 'Lux',
  //                     alarm: data.Lux[0].alarm,
  //                     ts: data.Lux[0].ts,
  //                     value: (data.Lux[0].value).toFixed(1)
  //                   };
  //                   element.dataDevice.push(dataSal);
  //                 }
  //               }
  //               else {
  //                 let check = 0;
  //                 element.dataDevice.forEach(e => {
  //                   if (e.key === 'Lux') {
  //                     check = 1;
  //                     e.value = null;
  //                     e.ts = null;
  //                     e.alarm = false;
  //                   }
  //                 });
  //                 if (check === 0) {
  //                   const dataSal = {
  //                     key: 'Lux',
  //                     alarm: false,
  //                     ts: null,
  //                     value: null
  //                   };
  //                   element.dataDevice.push(dataSal);
  //                 }
  //               }
  //             }
  //             if (element.name.toLowerCase().includes('humidity')) {

  //               if (!!data.Humidity[0] && data.Humidity[0].ts > (moment().valueOf() - 300000)) {
  //                 let check = 0;
  //                 element.dataDevice.forEach(e => {
  //                   if (e.key === 'Humidity') {
  //                     check = 1;
  //                     e.value = (data.Humidity[0].value).toFixed(1);
  //                     e.ts = data.Humidity[0].ts;
  //                     e.alarm = data.Humidity[0].alarm;
  //                   }
  //                 });
  //                 if (check === 0) {
  //                   const dataDO = {
  //                     key: 'Humidity',
  //                     alarm: data.Humidity[0].alarm,
  //                     ts: data.Humidity[0].ts,
  //                     value: (data.Humidity[0].value).toFixed(1)
  //                   };
  //                   element.dataDevice.push(dataDO);
  //                 }
  //               }
  //               else {
  //                 let check = 0;
  //                 element.dataDevice.forEach(e => {
  //                   if (e.key === 'Humidity') {
  //                     check = 1;
  //                     e.value = null;
  //                     e.ts = null;
  //                     e.alarm = false;
  //                   }
  //                 });
  //                 if (check === 0) {
  //                   const dataSal = {
  //                     key: 'Humidity',
  //                     alarm: false,
  //                     ts: null,
  //                     value: null
  //                   };
  //                   element.dataDevice.push(dataSal);
  //                 }
  //               }
  //             }
  //           }
  //         });
  //       }
  //     });
  // }

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
