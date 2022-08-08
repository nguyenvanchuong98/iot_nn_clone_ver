import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';

import 'chart.js';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { BaseChartDirective, Color, Label } from 'ng2-charts';
import * as zoomPlugin from 'chartjs-plugin-zoom';

import { GiamSatService } from './../../../../core/services/giam-sat.service';
import { arrayEqual } from '../../../../shared/utils';
import { IonContent, ModalController } from '@ionic/angular';
import { EChartsOption } from 'echarts';

export interface ZoneOnlySensor {
  tenantId?: string;
  damTomId?: string;
  zoneId?: string;
  zoneName?: string;
  deviceDtoList: DeviceSensor[];
}
enum TelemetryType {
  TEMPERATURE = 'Temperature',
  HUMIDITY = 'Humidity',
  LUX = 'Lux',
  UNKNOWN = 'Unknow',
  SENSOR = 'Sensor'
}
export interface DeviceSensor {
  id?: string;
  name?: string;
  label?: string;
  gatewayId?: string;
  deviceTypeName?: string;
  deviceType?: string;
  createdTime?: string;
  telemetryType?: TelemetryType[];
  tbKey?: string;
  telemetryData?: {
    ts: number;
    alarm?: boolean;
    value: any;
    nguongViPham?: string; // GREATER_OR_EQUAL - null - LESS_OR_EQUAL
  };
  order?: number;
  unit?: string;
  listDataValue?: any[];
  minValue?: number;
  maxValue?: number;
  chartDatasets?: ChartDataSets[];
  chartLabels?: Label[];
  fromDate?: string;
  toDate?: string;
  dataSensorCache?: DataTimeseries[];
  sliderLower?: number;
  sliderUpper?: number;
  lowerReset?: number;
  upperReset?: number;
  changeSlider?: boolean;
  isFilter?: boolean;
  tsLastChart?: number;
  nameChart?: string;
  deviceChartOptions?: ChartOptions;
  isSelectDuringTime?: boolean;

  // option echarts
  echartDatasets?: DataSet[];
  chartOption?: any;
  updateChartOption?: EChartsOption;
}

export interface DataSet {
  data?: any;
  name: string;
  type: 'line';
  smooth: true;
  lineStyle: {
    width: 2,
  };
  showSymbol: false;
}
export interface DataTimeseries {
  ts?: number;
  value: any;
}
export interface Device {
  gatewayId: string;
  deviceId: string;
  deviceName: string;
  deviceLabel: string;
  dataDevice: any[];
}
@Component({
  selector: 'app-du-lieu-cam-bien',
  templateUrl: './du-lieu-cam-bien.page.html',
  styleUrls: ['./du-lieu-cam-bien.page.scss'],
})
export class DuLieuCamBienPage implements OnInit {
  @ViewChild(IonContent) gotoTop: IonContent;
  @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective>;
  // telemetryType;
  isGoTop = false;
  endTime;
  timeInterval;
  chartInterval: number;
  interval = null;
  selectHour = false;
  listDevice: Device[] = [];
  lineChartPlugins = [zoomPlugin];

  dsGateway: any[];
  currentDate = moment(new Date()).add(7, 'hours').toISOString();
  toDate = moment().seconds(0).milliseconds(0).toISOString();
  fromDate = moment(new Date()).startOf('date').toDate().toISOString();
  damTomId: string;
  zoneIdFromDashboard: string;
  deviceIdFromDashboard;
  zoneSensor: ZoneOnlySensor;
  listDeviceSensor: DeviceSensor[] = [];
  intervaldb = null;
  intervalUpdateTelemetry = null;
  intervalUpdateTime = null;
  intervalUpdateToDate = null;

  deviceSensorSelected: DeviceSensor;
  customActionSheetOptions: any = {
    header: 'Chọn thiết bị',
    cssClass: 'my-custom-action-sheet',
  };

  constructor(
    private route: ActivatedRoute,
    private giamsatService: GiamSatService,
    public modalController: ModalController,
  ) { }

  ngOnInit() {
    this.route.queryParams
      // tslint:disable-next-line: deprecation
      .subscribe((data) => {
        this.damTomId = data.damtomid;
        // this.telemetryType = data.segment;
        this.zoneIdFromDashboard = data.zoneId;
        this.deviceIdFromDashboard = data.deviceId;
      });
  }
  ionViewDidEnter() {
    if (!!this.deviceIdFromDashboard) {
      this.focusSegment(this.deviceIdFromDashboard);
    }
  }
  async ionViewWillEnter() {
    await this.getZonesSensorOnly();

    this.getMinMaxSensor();

    const startDay = moment().startOf('day').valueOf(); // ms
    const currentTime = moment().valueOf(); // ms

    const timeToQuery = currentTime - startDay;
    const intervalTime = this.caculateIntervalTime(timeToQuery);

    await this.fetchDataSensorListDevice(intervalTime, startDay, currentTime);

    this.startInterval(this.deviceSensorSelected);

    this.updateCurrentTime();
    this.updateToDate();
  }
  // goi interval va update time cho ngay hien tai
  // ngay cua qua khu thi stop interval
  startInterval(device: DeviceSensor) {
    this.stopInterval();
    const intervalDefalt = 300000; // 5phut
    this.intervaldb = setInterval(() => {
      const startTs = moment(device.tsLastChart).add(2, 'minute').add(30, 'second').valueOf();
      const endTs = moment(device.tsLastChart).add(7, 'minute').add(30, 'second').valueOf();
      this.fetchDataSensorListDevice(intervalDefalt, startTs, endTs);
      this.getMinMaxSensor();
    }, 300000);
  }

  // update lastest telemetry moi phut
  updateTelemetry(device: DeviceSensor) {
    this.stopUpdateTelemetry();

    this.intervalUpdateTelemetry = setInterval(() => {
      const startTs = moment(device.tsLastChart).add(2, 'minute').add(30, 'second').valueOf();
      const endTs = moment(device.tsLastChart).add(7, 'minute').add(30, 'second').valueOf();

      this.getLastestTelemetrySensor(startTs, endTs);
    }, 300000);
  }
  stopUpdateTelemetry() {
    if (!this.intervalUpdateTelemetry) {
      return;
    }
    clearInterval(this.intervalUpdateTelemetry);
    this.intervalUpdateTelemetry = null;
  }

  updateCurrentTime() {
    this.stopUpdateTime();

    this.intervalUpdateTime = setInterval(() => {
      this.currentDate = moment(new Date()).add(7, 'hours').add(1, 'second').toISOString();
    }, 1000);
  }
  stopUpdateTime() {
    if (!this.intervalUpdateTime) {
      return;
    }
    clearInterval(this.intervalUpdateTime);
    this.intervalUpdateTime = null;
  }

  updateToDate() {
    this.stopUpdateToDate();

    this.intervalUpdateToDate = setInterval(() => {
      this.zoneSensor.deviceDtoList.forEach(device => {
        if (!device.isFilter) {
          device.toDate = moment().add(1, 'second').toISOString();
        }
      });
    }, 1000);
  }
  stopUpdateToDate() {
    if (!this.intervalUpdateToDate) {
      return;
    }
    clearInterval(this.intervalUpdateToDate);
    this.intervalUpdateToDate = null;
  }

  stopInterval() {
    if (!this.intervaldb) {
      return;
    }
    clearInterval(this.intervaldb);

    this.intervaldb = null;
  }

  ionViewWillLeave() {
    clearInterval(this.interval);
    this.interval = null;
    this.stopInterval();
    this.stopUpdateTelemetry();
    this.stopUpdateTime();
    this.stopUpdateToDate();
  }

  checkValueWarning(device: DeviceSensor, value: any, ts?: number) {
    console.log(value);
    if (!!value) {
      this.giamsatService.checkTelemetryRule(device.id, device.telemetryType[0], value, ts)
      .subscribe(res => {
        device.telemetryData.alarm = res.alarm;
        device.telemetryData.nguongViPham = res.nguongViPham;
      });
    }
  }
  // get data sensor update api cua a Binh => ko dung
  // getListDeviceSensorAvgUpdate(startTs?: string, endTs?: string, interval?: number){
  //   const orderBy = 'DESC';
  //   this.listDeviceSensor.forEach(device => {
  //     this.giamsatService.getDataSensorAvg(
  //         device.deviceId,
  //         device.telemetryType,
  //         startTs,
  //         endTs,
  //         interval,
  //         orderBy).subscribe(res => {
  //       const data = res[device.telemetryType];
  //       if(!!data){
  //         // console.log('co co data');
  //         //so sanh 2 array khac nhau thi gan lai
  //         if(!arrayEqual(device.dataSensorCache, data) && parseInt(endTs) - parseInt(startTs) !== 300000){
  //           device.dataSensorCache = data;

  //           //data tra ve mang object DataTimeseries
  //           device.dataSensorCache.forEach(dataTs => {
  //             device.listDataValue.push(parseFloat(dataTs.value).toFixed(1));

  //             device.chartDatasets.forEach((dataset) => {
  //               dataset.data = device.listDataValue;
  //               dataset.label = !!device.deviceLabel? device.deviceLabel : device.deviceName;
  //               dataset.fill = false;
  //             });

  //             if(device.chartLabels.indexOf( moment(new Date(dataTs.ts)).format('DD/MM/YY HH:mm')) === -1){
  //               device.chartLabels.push( moment(new Date(dataTs.ts)).format('DD/MM/YY HH:mm') );
  //             }
  //           });
  //           //lay lastest telemetry = phan tu cuoi cua data tu api AVG tra ve
  //           device.telemetryData = {
  //             value: device.listDataValue[device.listDataValue.length - 1],
  //             ts: device.dataSensorCache[device.dataSensorCache.length - 1].ts,
  //             alarm: this.checkValueWarning(device, device.listDataValue[device.listDataValue.length - 1]),
  //           }
  //         }
  //         else if(parseInt(endTs) - parseInt(startTs) === 300000){
  //           data.forEach(dataTs => {
  //             device.listDataValue.push(parseFloat(dataTs.value).toFixed(1));

  //             device.chartDatasets.forEach((dataset) => {
  //               dataset.data = device.listDataValue;
  //               dataset.label = !!device.deviceLabel? device.deviceLabel : device.deviceName;
  //               dataset.fill = false;
  //             });

  //             if(device.chartLabels.indexOf( moment(new Date(dataTs.ts)).format('DD/MM/YY HH:mm')) === -1){
  //               device.chartLabels.push( moment(new Date(dataTs.ts)).format('DD/MM/YY HH:mm') );
  //             }
  //           })
  //           device.dataSensorCache.push(data[0]);
  //         }
  //       }
  //       // else{
  //       //   // console.log('khong co data');
  //       //   device.listDataValue = [];
  //       //
  //       //   device.dataSensorCache.forEach(dataTs => {
  //       //
  //       //     device.listDataValue.push(parseFloat(dataTs.value).toFixed(2));
  //       //
  //       //     device.chartDatasets.forEach((dataset) => {
  //       //       dataset.data = device.listDataValue;
  //       //       dataset.label = !!device.deviceLabel? device.deviceLabel : device.deviceName;
  //       //       dataset.fill = false;
  //       //     });
  //       //
  //       //     if(device.chartLabels.indexOf( moment(new Date(dataTs.ts)).format('DD/MM/YY HH:mm')) === -1){
  //       //       device.chartLabels.push( moment(new Date(dataTs.ts)).format('DD/MM/YY HH:mm') );
  //       //     }
  //       //   });
  //       // }
  //       //update bieu do
  //       this.charts.forEach((child) => {
  //         child.chart.update();
  //       });
  //     })
  //   })
  // }
  // getOneDeviceDataAvg(device?: DeviceSensor){
  //   const timeToQuery = new Date(device.toDate).getTime() - new Date(device.fromDate).getTime();
  //   const intervalTime = this.caculateIntervalTime(timeToQuery);
  //   //reset data
  //   device.chartLabels = [];
  //   device.listDataValue = [];
  //   device.chartDatasets = [];
  //   const dataset = {
  //     data: [],
  //     label: '',
  //     fill: false
  //   }
  //   device.chartDatasets.push(dataset);

  //   this.giamsatService.getDataSensorAvg(
  //       device.deviceId,
  //       device.telemetryType,
  //       moment(device.fromDate).valueOf().toString(),
  //       moment(device.toDate).valueOf().toString(),
  //       intervalTime
  //   ).subscribe(res => {
  //     const data = res[device.telemetryType];

  //     if(!!data){
  //       // console.log('co co data');
  //       //data tra ve mang object DataTimeseries
  //       data.forEach(dataTs => {
  //         device.listDataValue.push(parseFloat(dataTs.value).toFixed(1));

  //         device.chartDatasets.forEach((dataset) => {
  //           dataset.data = device.listDataValue;
  //           dataset.label = !!device.deviceLabel? device.deviceLabel : device.deviceName;
  //           dataset.fill = false;
  //         });

  //         if(device.chartLabels.indexOf( moment(new Date(dataTs.ts)).format('DD/MM/YY HH:mm')) === -1){
  //           device.chartLabels.push( moment(new Date(dataTs.ts)).format('DD/MM/YY HH:mm') );
  //         }
  //       });
  //     }else{
  //       // console.log('khong co data');
  //     }
  //     //update bieu do
  //     this.charts.forEach((child) => {
  //       child.chart.update();
  //     });
  //   })
  // }
  // getLastestTelemetryUpdate(){
  //   const orderBy = 'DESC';
  //   const interval = 300000;
  //   let endTs = moment().valueOf(); //ms
  //   let startTs = moment().subtract(7,'minute').valueOf(); //ms

  //   this.listDeviceSensor.forEach(device => {
  //     this.giamsatService.getDataSensorAvg(
  //         device.deviceId,
  //         device.telemetryType,
  //         startTs.toString(),
  //         endTs.toString(),
  //         interval,
  //         orderBy).subscribe(res => {

  //       const data = res[device.telemetryType];
  //       if(!!data){
  //         data.forEach((dataTs) => {
  //           if(data.ts < (moment().valueOf() - 300000)){
  //             device.telemetryData = {
  //               value: null,
  //               ts: null,
  //               alarm: false,
  //             }
  //           } else{
  //             device.telemetryData = {
  //               value: Number(parseFloat(dataTs.value.toString()).toFixed(1)),
  //               ts: dataTs.ts,
  //               alarm: this.checkValueWarning(device, dataTs.value),
  //             }
  //           }
  //         })
  //       }
  //     })
  //   })
  // }
  // ---------------------------------------------------
  changeDevice(event) {
    this.deviceSensorSelected = event;
  }

  doRefresh(event) {
    setTimeout(async () => {
      // this.ionViewWillEnter();
      await this.fetchDataSensorDevice();
      event.target.complete();
    }, 1000);
  }

  async fetchDataSensorDevice() {
    const timeToQuery = new Date(this.deviceSensorSelected.toDate).getTime() - new Date(this.deviceSensorSelected.fromDate).getTime();
    const intervalTime = this.caculateIntervalTime(timeToQuery);

    // tslint:disable-next-line: max-line-length
    await this.getDataTsSensor(
      intervalTime,
      this.deviceSensorSelected.id,
      this.deviceSensorSelected.telemetryType,
      moment(this.deviceSensorSelected.fromDate).valueOf(),
      moment(this.deviceSensorSelected.toDate).valueOf())
    .then(async data => {
      this.deviceSensorSelected.listDataValue = [];

      if (!!data) {
        // console.log('co co data');
        // data tra ve mang object DataTimeseries
        this.deviceSensorSelected.dataSensorCache = [];
        this.deviceSensorSelected.dataSensorCache = data;
        console.log('fetchDataSensorDevice', this.deviceSensorSelected.dataSensorCache);
        this.deviceSensorSelected.dataSensorCache.forEach(dataTs => {
          if (this.deviceSensorSelected.tbKey.includes('Lux')) {
            dataTs.value = Math.round(dataTs.value);
          } else {
            dataTs.value = parseFloat(dataTs.value).toFixed(1);
          }
        });

        // fix time diem cuoi = time hien tai
        if (moment().valueOf() === moment(this.deviceSensorSelected.fromDate).valueOf()) {
          this.deviceSensorSelected.dataSensorCache[this.deviceSensorSelected.dataSensorCache.length - 1].ts
        = this.deviceSensorSelected.dataSensorCache[this.deviceSensorSelected.dataSensorCache.length - 1].ts
        !== moment().valueOf() ? moment().valueOf()
        : this.deviceSensorSelected.dataSensorCache[this.deviceSensorSelected.dataSensorCache.length - 1].ts;
        }

        setTimeout(() => {
          this.initEChartOptions(this.deviceSensorSelected);
        }, 100);

        data.forEach(dataTs => {
          if (this.deviceSensorSelected.tbKey.includes('Lux')) {
            this.deviceSensorSelected.listDataValue.push(Math.round(dataTs.value));
          } else {
            this.deviceSensorSelected.listDataValue.push(parseFloat(dataTs.value).toFixed(1));
          }
        });
      } else {
        // console.log('khong co data');
        return;
      }
    });
  }

  sliderClick() {
    this.selectHour = !this.selectHour;
  }

  // --------------------- Bich - refactor ----------------------
  // api cua thingsboard ko tra ve 0 neu ko co du lieu
  fetchDataSensorListDevice(interval: number, startTs: number, endTs: number) {
    // get data cho tung sensor device
    this.zoneSensor.deviceDtoList?.forEach((device) => {
      this.getDataTsSensor(interval, device.id, device.telemetryType, startTs, endTs).then(data => {
        if (!!data) {
          // so sanh 2 array khac nhau thi gan lai
          if (!arrayEqual(device.dataSensorCache, data) && (endTs - startTs !== 300000)) {
            // console.log('fetch tat data luc dau', data);
            device.dataSensorCache = data;
            // data tra ve mang object DataTimeseries
            device.dataSensorCache.forEach((dataTs) => {
              if (dataTs.value !== null) {
                if (device.tbKey.includes('Lux')) {
                  device.listDataValue.push(Math.round(dataTs.value));
                  dataTs.value = Math.round(dataTs.value);
                } else {
                  device.listDataValue.push(parseFloat(dataTs.value).toFixed(1));
                  dataTs.value = parseFloat(dataTs.value).toFixed(1);
                }
              }
            });

            // fix time diem cuoi = time hien tai
            device.dataSensorCache[device.dataSensorCache.length - 1].ts = device.dataSensorCache[device.dataSensorCache.length - 1].ts 
            !== moment().valueOf() ? moment().valueOf()
            : device.dataSensorCache[device.dataSensorCache.length - 1].ts;

            this.initEChartOptions(device);

            console.log('559', device.chartOption);

            // lay lastest telemetry = phan tu cuoi cua data tu api AVG tra ve
            const lastElementTs = device.dataSensorCache[device.dataSensorCache.length - 1];
            device.tsLastChart = lastElementTs.ts !== moment().valueOf() ? moment().valueOf() : lastElementTs.ts;
            if (lastElementTs.ts < (moment().valueOf() - 120000)) {
              device.telemetryData = {
                value: null,
                ts: null,
                alarm: false,
                nguongViPham: null
              };
            } else {
              device.telemetryData = {
                value: device.listDataValue[device.listDataValue.length - 1],
                ts: lastElementTs.ts !== moment().valueOf() ? moment().valueOf() : lastElementTs.ts,
              };
              this.checkValueWarning(device, device.listDataValue[device.listDataValue.length - 1], device.tsLastChart);
            }
          }
          else if (endTs - startTs === 300000 && !device.isFilter) {
            if (moment(data[0].ts).valueOf() !== moment().valueOf() )  {
              data[0].ts = moment().valueOf();
            }

            data.forEach(dataTs => {
              console.log('goi data sau 5p', dataTs);
              device.tsLastChart = moment(dataTs.ts).valueOf() !== moment().valueOf() ? moment().valueOf() : dataTs.ts;

              device.listDataValue.push(parseFloat(dataTs.value).toFixed(1));
              // lastest telemetry
              if (dataTs.value === null) {
                device.telemetryData = {
                  value: null,
                  ts: moment(dataTs.ts).valueOf() !== moment().valueOf() ? moment().valueOf() : dataTs.ts,
                };
              } else {
                if (device.tbKey.includes('Lux')) {
                  device.telemetryData = {
                    value: Math.round(dataTs.value),
                    ts: moment(dataTs.ts).valueOf() !== moment().valueOf() ? moment().valueOf() : dataTs.ts,
                  };
                } else {
                  device.telemetryData = {
                    value: Number(parseFloat(dataTs.value?.toString()).toFixed(1)),
                    ts: moment(dataTs.ts).valueOf() !== moment().valueOf() ? moment().valueOf() : dataTs.ts,
                  };
                }
                this.checkValueWarning(device, dataTs.value, device.tsLastChart);
              }
            });
            if (device.tbKey.includes('Lux')) {
              data[0].value = Math.round(data[0].value);
            } else {
              data[0].value = parseFloat(data[0].value).toFixed(1);
            }
            device.dataSensorCache.push(data[0]);
            this.updateEchartOptions(device, device.dataSensorCache);
          } else if (device.isFilter) {
            this.stopInterval();
          }
        }
        else {
          console.log('khong co data');
          // device mat ket noi
          device.telemetryData = {
            value: null,
            ts: null,
            alarm: false,
          };
          this.initEChartOptions(device);
          if (device.isFilter) {
            this.stopInterval();
          }
        }
      });
    });
  }
  
  initEChartOptions(device: DeviceSensor) {
    device.echartDatasets = [];
    const dataSet: DataSet = {
      data: [],
      name: !!device.label ? device.label : device.name,
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 2,
      },
      showSymbol: false,
    };
    device.chartOption = {
      lineStyle: {
        width: 2
      },
      textStyle: {
        fontStyle: 'normal',
        fontFamily: 'Inter var',
        fontSize: 16
      },
      grid: {
        left: '5%',
        right: '4%',
        // bottom: '3%',
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0b0e10',
        textStyle: {
          fontSize: 10,
          color: "rgba(255, 255, 255, 1)",
          fontWeight: "bold"
        },
        // position: ['15%', '40%'],
        alwaysShowContent: false,
        displayMode: 'single',
        z: 60,
        triggerOn: 'mousemove|click',
        axisPointer: {
          type: 'line',
          axis: 'auto',
          label: {
            show: false
          }
        },
        borderWidth: 0,
        confine: true
      },
      xAxis: {
        type: 'time',
        silent: false,
        splitLine: {
          show: true,
          lineStyle: {
            color: "#314147"
          }
        },
        axisLabel: {
          fontSize: 10,
          fontFamily: 'Inter var',
          color: '#fff',
          interval: 0,
          rotate: 45,
          // formatter: '{dd}/{MM} {HH}:{mm}'
        },
        axisTick: {
          show: true,
          length: 3,
          interval: 2,
          inside: true,
          alignWithLabel: true,
        },
      },
      yAxis: {
        // min: 0,
        // max: 100,
        axisLabel: {
          fontSize: 10,
          fontFamily: 'Inter var',
          color: '#fff'
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#314147"
          }
        },
        axisLine: {
          show: true
        },
        axisTick: {
          show: true
        },
      },
      legend: {
        show: false,
      },
      dataZoom: [
        {
          minSpan: 10,
          type: 'inside',
        },
      ],
      series: device.echartDatasets,
    };

    device.dataSensorCache.forEach((dataTs, index) => {
      if (dataTs.value !== null) {
        // push data for echarts
        const ts = dataTs.ts;
        const value = Number(parseFloat(dataTs.value).toFixed(1));
        const chartdata = [ts, value];
        dataSet.data.push(chartdata);
      } else {
        dataSet.data.push([dataTs.ts, dataTs.value]);
      }
    });
    // push data for echarts
    device.echartDatasets.push(dataSet);

    if (this.deviceSensorSelected.isSelectDuringTime) {
      device.chartOption.xAxis = {
        type: 'time',
        silent: false,
        splitLine: {
          show: true,
          lineStyle: {
            color: "#314147"
          }
        },
        axisLabel: {
          fontSize: 10,
          fontFamily: 'Inter var',
          color: '#fff',
          interval: 0,
          rotate: 45,
          formatter: '{dd}/{MM} {HH}:{mm}'
        },
        axisTick: {
          show: true,
          length: 3,
          interval: 2,
          inside: true,
          alignWithLabel: true,
        },
      }
      device.chartOption.series = device.echartDatasets;
    } else {
        device.chartOption.series = device.echartDatasets;
    }

    // check xem bieu do co null tat khong
    if (device.dataSensorCache.find(dataTs => dataTs.value !== null) == undefined) {
      device.chartOption.yAxis = {
        min: 0,
        max: 100,
        axisLabel: {
          fontSize: 10,
          fontFamily: 'Inter var',
          color: '#fff'
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#314147"
          }
        },
        axisLine: {
          show: true
        },
        axisTick: {
          show: true
        },
      }
    }
  }
  updateEchartOptions(device: DeviceSensor, dataTsRealTime?: DataTimeseries[]) {
    device.echartDatasets = [];
    const dataSet: DataSet = {
      data: [],
      name: !!device.label ? device.label : device.name,
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 2,
      },
      showSymbol: false,
    };
    dataTsRealTime.forEach(dataTs => {
      // push data for echarts
      const ts = dataTs.ts;
      const value = Number(parseFloat(dataTs.value).toFixed(2));
      const chartdata = [ts, value];
      dataSet.data.push(chartdata);
    });
    // push dataset cho echart
    device.echartDatasets.push(dataSet);

    device.updateChartOption = {
      series: device.echartDatasets
    };
  }
  // get du lieu telemetry trung binh moi nhat cua sensor
  getLastestTelemetrySensor(startTs: number, endTs: number) {
    const interval = 300000;
    this.zoneSensor.deviceDtoList.forEach((device) => {
      this.getDataTsSensor(interval, device.id, device.telemetryType, startTs, endTs).then(data => {
        // console.log('1051',data, moment(startTs).format('HH:mm:ss'), moment(endTs).format('HH:mm:ss'));

        if (!!data) {
          // data tra ve mang object DataTimeseries
          data.forEach(dataTs => {
            if (device.tbKey.includes('Lux')) {
              device.telemetryData = {
                value: Math.round(dataTs.value.toString()),
                ts: moment(dataTs.ts).valueOf() !== moment().valueOf() ? moment().valueOf() : dataTs.ts,
              };
            } else {
              device.telemetryData = {
                value: Number(parseFloat(dataTs.value.toString()).toFixed(1)),
                ts: moment(dataTs.ts).valueOf() !== moment().valueOf() ? moment().valueOf() : dataTs.ts,
              };
            }
            this.checkValueWarning(device, dataTs.value, dataTs.ts);
          });
        } else {
          // device mat ket noi
          device.telemetryData = {
            value: null,
            ts: null,
            alarm: false,
          };
        }
      });
    });
  }
  // get data sensor device
  async getDataTsSensor(interval: number, deviceId, deviceType, startTs: number, endTs: number) {
    const entityType = 'DEVICE';
    const limit = 0;
    const agg = 'AVG';
    const orderBy = 'DESC';

    // api tra ve object theo telemetry type - chua mang object ts value
    const dataSensor = await this.giamsatService.getDataSensorDevice(
      entityType,
      deviceId,
      interval,
      limit,
      agg,
      orderBy,
      deviceType,
      startTs.toString(),
      endTs.toString()).toPromise();

      // api tra ve gia tri null
    const dataSensorAvg = await this.giamsatService.getDataSensorAvg(
      deviceId,
      deviceType,
      startTs.toString(),
      endTs.toString(),
      interval,
      orderBy
    ).toPromise();

    console.log(dataSensorAvg);
    return dataSensorAvg[deviceType];
  }
  // lay nhung zone chi co sensor device sau do so sanh voi zoneid duoc chuyen tu dashboard sang
  async getZonesSensorOnly() {
    this.listDeviceSensor = [];
    const res = await this.giamsatService.getZoneOnlySensorDevice(this.damTomId).toPromise();

    this.zoneSensor = res.find(zone => zone.zoneId === this.zoneIdFromDashboard);

    // map lai du lieu cua device sensor
    if (!!this.zoneSensor) {
      this.zoneSensor?.deviceDtoList.forEach(dv => {
        const typeDevice = dv.tbKey;
        dv.telemetryData = {
          ts: null,
          alarm: false,
          value: null,
          nguongViPham: null
        };
        dv.order = typeDevice.includes('Temperature') ? 1 :
        (typeDevice.includes('Humidity') ? 2 :
        (typeDevice.includes('Lux') ? 3 : 4));
        dv.unit = typeDevice.includes('Temperature') ? '°C' :
        (typeDevice.includes('Humidity') ? '%' :
        (typeDevice.includes('Lux') ? 'lux' : ''));
        dv.listDataValue = [];
        dv.chartDatasets = [];
        dv.chartLabels = [];
        dv.fromDate = moment().startOf('day').toISOString();
        dv.toDate = moment().toISOString();
        dv.dataSensorCache = [];
        dv.changeSlider = false;
        dv.isFilter = false;
        dv.deviceChartOptions = {
            elements: {
              point: {
                radius: 0
              }
            },
            responsive: true,
            defaultColor: '#333',
            legend: {
              display: false,
              position: 'bottom',
            },
            scales: {
              scaleLabel: {
                fontColor: '#333',
              },
              ticks: {
                fontColor: '#333',
                minor: {
                  fontColor: '#333'
                }
              },
              xAxes: [{
                distribution: 'series',
                ticks: {
                  fontColor: 'white'
                }
              }],
              yAxes: [
                {
                  type: 'linear',
                  display: true,
                  scaleLabel: {
                    display: true,
                  },
                  ticks: {
                    fontColor: 'white',
                    min: 0,
                    max: 100,
                    autoSkip: true,
                    maxRotation: 0,
                    major: {
                      enabled: true
                    },
                  }
                },
              ],
            },
            tooltips: {
              mode: 'nearest',
              intersect: false,
              titleAlign: 'center',
              callbacks: {
              }
            },
            hover: {
              mode: 'nearest',
              intersect: false,
            },
            plugins: {
              zoom: {
                pan: {
                  enabled: true,
                  mode: 'x',
                  speed: 10,
                  threshold: 10,
                },
                zoom: {
                  enabled: true,
                  drag: false,
                  mode: 'x',
                },
              },
            },
        };
        dv.echartDatasets = [];
        dv.chartOption = null;
        dv.updateChartOption = {};
      });
    } else if (this.zoneSensor === undefined) {
      this.zoneSensor = res.find(zone => zone.zoneName === 'Chưa có phân vùng');
      this.zoneSensor?.deviceDtoList.forEach(dv => {
        const typeDevice = dv.tbKey;
        dv.telemetryData = {
          ts: null,
          alarm: false,
          value: null,
        };
        dv.order = typeDevice.includes('Temperature') ? 1 :
        (typeDevice.includes('Humidity') ? 2 :
        (typeDevice.includes('Lux') ? 3 : 4));
        dv.unit = typeDevice.includes('Temperature') ? '°C' :
        (typeDevice.includes('Humidity') ? '%' :
        (typeDevice.includes('Lux') ? 'lux' : ''));
        dv.listDataValue = [];
        dv.chartDatasets = [];
        dv.chartLabels = [];
        dv.fromDate = moment().startOf('day').toISOString();
        dv.toDate = moment().toISOString();
        dv.dataSensorCache = [];
        dv.changeSlider = false;
        dv.isFilter = false;
        dv.deviceChartOptions = {
            elements: {
              point: {
                radius: 0
              }
            },
            responsive: true,
            defaultColor: '#333',
            legend: {
              display: false,
              position: 'bottom',
            },
            scales: {
              scaleLabel: {
                fontColor: '#333',
              },
              ticks: {
                fontColor: '#333',
                minor: {
                  fontColor: '#333'
                }
              },
              xAxes: [{
                distribution: 'series',
                ticks: {
                  fontColor: 'white'
                }
              }],
              yAxes: [
                {
                  type: 'linear',
                  display: true,
                  scaleLabel: {
                    display: true,
                  },
                  ticks: {
                    fontColor: 'white',
                    min: 0,
                    max: 100,
                    autoSkip: true,
                    maxRotation: 0,
                    major: {
                      enabled: true
                    },
                  }
                },
              ],
            },
            tooltips: {
              mode: 'nearest',
              intersect: false,
              titleAlign: 'center',
              callbacks: {
              }
            },
            hover: {
              mode: 'nearest',
              intersect: false,
            },
            plugins: {
              zoom: {
                pan: {
                  enabled: true,
                  mode: 'x',
                  speed: 10,
                  threshold: 10,
                },
                zoom: {
                  enabled: true,
                  drag: false,
                  mode: 'x',
                },
              },
            },
        };
        dv.echartDatasets = [];
        dv.chartOption = null;
        dv.updateChartOption = {};
      });
    }
    this.zoneSensor.deviceDtoList.sort((a, b) => {
        // sep theo thu tu tang dan nhiet do - do am - anh sang
        if (a.order > b.order) { return 1; }
        if (a.order < b.order) { return -1; }
        // sep theo time tao moi nhat -> cu nhat
        if (a.createdTime > b.createdTime) { return -1; }
        if (a.createdTime < b.createdTime) { return 1; }
    });

    // console.log(this.zoneSensor);

    // get name bieu do
    this.zoneSensor.deviceDtoList.forEach(device => {
      this.getNameChart(device);
    });

    // find device sensor selected
    this.deviceSensorSelected = this.zoneSensor.deviceDtoList.find((device) => {
      return device.id === this.deviceIdFromDashboard;
    });
  }

  getMinMaxSensor() {
    // load min max lan dau cho tat ca device
      // tslint:disable-next-line: no-shadowed-variable
      this.zoneSensor.deviceDtoList.forEach((device) => {
        // tslint:disable-next-line: max-line-length
        this.giamsatService.getMinMax(device.id, device.telemetryType[0], moment(device.fromDate).valueOf().toString(), moment(device.toDate).valueOf().toString())
          .subscribe(res => {
            if (res.MIN === '0' && res.MAX === '0') {
              device.minValue = Number(parseFloat(res.MIN).toFixed(1));
              device.maxValue = Number(parseFloat(res.MAX).toFixed(1));

              // if (!device.changeSlider) {
              //   this.setSliderChart(Math.round(res.MIN), Math.round(res.MAX), device);
              // }
            } else {
              device.minValue = Number(parseFloat(res.MIN).toFixed(1));
              device.maxValue = Number(parseFloat(res.MAX).toFixed(1));

              // if (!device.changeSlider) {
              //   this.setSliderChart(Math.round(res.MIN), Math.round(res.MAX), device);
              // }
            }
          });
      });
  }
  setSliderChart(min?: number, max?: number, device?: DeviceSensor) {
    this.getMinSlider(min, device);
    this.getMaxSlider(max, device);

    this.initOptionChart(device, device.sliderLower, device.sliderUpper);
  }
  getMinSlider(min, device: DeviceSensor) {
    const startNumber = 0;
    const endNumber = 2;

    if (min < 10 && min >= 0) {
      device.sliderLower = 0;
    } else {
      const str = min.toString();
      const firstNumber = str.slice(startNumber, endNumber);
      device.sliderLower = Math.floor(firstNumber / 10) * 10 * (10 ** (str.length - endNumber));
    }
    device.lowerReset = device.sliderLower;
  }
  getMaxSlider(max, device: DeviceSensor) {
    max += 1;
    const startNumber = 0;
    const endNumber = 2;

    if (max < 10 && max >= 0) {
      device.sliderUpper = 10;
    } else {
      const str = max.toString();
      const firstNumber = str.slice(startNumber, endNumber);
      device.sliderUpper = Math.ceil(firstNumber / 10) * 10 * (10 ** (str.length - endNumber));
    }
    device.upperReset = device.sliderUpper;
  }

  initOptionChart(device: DeviceSensor, min: number, max: number) {
    device.deviceChartOptions = {
      elements: {
        point: {
          radius: 0
        }
      },
      responsive: true,
      defaultColor: '#333',
      legend: {
        display: false,
        position: 'bottom',
        labels: {
          fontColor: '#333'
        }
      },
      scales: {
        scaleLabel: {
          fontColor: '#333',
        },
        ticks: {
          fontColor: '#333',
          minor: {
            fontColor: '#333'
          }
        },
        xAxes: [{
          distribution: 'series',
          ticks: {
            fontColor: 'white'
          }
        }],
        yAxes: [
          {
            type: 'linear',
            display: true,
            scaleLabel: {
              display: true,
            },
            ticks: {
              fontColor: 'white',
              min,
              max,
              autoSkip: true,
              maxRotation: 0,
              major: {
                enabled: true
              },
            }

          },
        ],
      },
      tooltips: {
        mode: 'nearest',
        intersect: false,
        titleAlign: 'center',
        callbacks: {
        }
      },
      hover: {
        mode: 'nearest',
        intersect: false,
      },
      plugins: {
        zoom: {
          pan: {
            enabled: true,
            mode: 'x',
            speed: 10,
            threshold: 10,
          },
          zoom: {
            enabled: true,
            drag: false,
            mode: 'x',
          },
        },
      },
    };
  }

  public getNameChart(device: DeviceSensor) {
    const defaultName = !!device.label ? device.label : device.name;

    this.giamsatService.getNameChart(device.id, device.telemetryType[0]).subscribe(res => {
      device.nameChart = !!res ? res.chartName : defaultName;
    });
  }

  // tính toán interval theo khoảng giá trị của filter
  caculateIntervalTime(timeToQuery): number {
    // time < 12h
    // if(timeToQuery < 12*60*60*1000)
    // {
    //   return 60*1000;
    // }
    // time < 24 hour
    if (timeToQuery <= 24 * 60 * 60 * 1000) {
      return 5 * 60 * 1000; // 5 phut
    }
    // 24 hour < time < 7 days
    if (timeToQuery > 24 * 60 * 60 * 1000 && timeToQuery <= 7 * 24 * 60 * 60 * 1000) {
      return 40 * 60 * 1000; // 40min
    }
    // 7 days < time < 14 days
    if (timeToQuery > 7 * 24 * 60 * 60 * 1000 && timeToQuery <= 14 * 24 * 60 * 60 * 1000) {
      return 2 * 40 * 60 * 1000; // 80 min
    }
    // 14days < time < 21 days
    if (timeToQuery > 14 * 24 * 60 * 60 * 1000 && timeToQuery <= 21 * 24 * 60 * 60 * 1000) {
      return 3 * 40 * 60 * 1000; // 2h
    }
    // 21days<time < 31 days
    if (timeToQuery > 21 * 24 * 60 * 60 * 1000 && timeToQuery <= 31 * 24 * 60 * 60 * 1000) {
      return 3 * 60 * 60 * 1000; // 3h
    }
    // 31days<time < 6month
    if (timeToQuery > 31 * 24 * 60 * 60 * 1000 && timeToQuery <= 183 * 24 * 60 * 60 * 1000) {
      return 12 * 60 * 60 * 1000; // 12h
    }
    // 6month<time < 12month
    if (timeToQuery > 183 * 24 * 60 * 60 * 1000 && timeToQuery <= 365 * 24 * 60 * 60 * 1000) {
      return 24 * 60 * 60 * 1000; // 24h
    }
    // time > 1year
    if (timeToQuery > 365 * 24 * 60 * 60 * 1000) {
      return 30 * 24 * 60 * 60 * 1000;
    }
  }

  async segmentChanged(event: any) {
    // this.deviceIdFromDashboard = event.detail.value;
    // console.log(event.detail.value);
    this.deviceSensorSelected = event.detail.value;
    this.focusSegment(event.detail.value);

    // if(moment(device.toDate).format('DD/MM/YY HH:mm') === moment().format('DD/MM/YY HH:mm')){
    //   device.toDate = moment().toISOString();
    //   this.currentDate = moment(new Date()).add(7, 'hours').toISOString();
    // }
  }


  focusSegment(deviceId) {
    document.getElementById(deviceId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
    // debugger
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
}
