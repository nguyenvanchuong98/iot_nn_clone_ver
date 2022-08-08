import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { BaoCaoService } from 'src/app/core/services/bao-cao.service';
import { DamTom } from 'src/app/core/services/report-schedule.service';

// const keysParam = ['Salinity', 'pH', 'Temperature', 'DO', 'ORP']
const keysParam = ['Humidity', 'Temperature', 'Lux'];
@Component({
  selector: 'app-tong-hop',
  templateUrl: './tong-hop.page.html',
  styleUrls: ['./tong-hop.page.scss'],
})
export class TongHopPage implements OnInit {
  @ViewChild(IonContent) gotoTop: IonContent;

  constructor(
    private fb: FormBuilder,
    private baoCaoService: BaoCaoService
  ) { }
  isGoTop = false;
  tempChartOption;
  humChartOption;
  luxChartOption;
  chartOption;
  form: FormGroup;
  now = new Date().toISOString();
  fiveDayAgo = new Date();
  startTs: number;
  endTs: number;
  bcKetNoi;
  warningChartDataset: any[] = [];
  data: number[] = [];

  warningChartLabels: any[] = [];
  dataBieudo = [];
  humidityDatasets: any[] = [];
  humidityChartLabels: any[] = [];
  datasets = [];
  chartLabels: any[] = [];
  Tempdatasets: any[] = [];
  TempChartLabels: any[] = [];
  luxDataset: any[] = [];
  luxChartLabels: any[] = [];
  isLoadingTemp = false;
  isLoadingsalinity = false;
  isLoadingPH = false;
  isLoadingORP = false;
  isLoading = false;
  isDamTomLoading = false;
  invalidDate = false;
  maxFromTo: string = new Date().toISOString();
  selectedValue;
  damTomList: DamTom[] = [];
  chartLabel: any[] = [];
  chartData: any[] = [
  ];
  dataset = {
    data: [],
    name: '',
    type: 'line',
    smooth: true,
    lineStyle: {
      width: 3,
    },
    showSymbol: false
  };

  customActionSheetOptions: any = {
    header: 'Chọn Nhà vườn',
    cssClass: 'my-custom-action-sheet',
  };

  selectHour = false;
  validateDay() {
    const dateF = new Date(this.form.get('dateTo').value);
    dateF.setDate(dateF.getDate() /*- 1*/);

    const dateFrom = this.form.get('dateFrom').value;
    const dateTo = this.form.get('dateTo').value;
    this.maxFromTo = dateF.toISOString();
    if (dateTo < dateFrom) {
      if (dateTo.split('T')[0] !== dateFrom.split('T')[0]) {
        this.invalidDate = true;
        return;
      }

    }
    this.invalidDate = false;
    let startTs: any = new Date(Date.parse(this.form.get('dateFrom').value));
    startTs.setHours(0, 0, 0, 0);
    startTs = (Date.parse(startTs.toISOString()));
    const endTs = this.convertEndTs(Date.parse(this.form.get('dateTo').value));
    // let endTs = Date.parse(this.form.get('dateTo').value);
    if (!isNaN(startTs) && !isNaN(endTs)) {
      const damTomId = this.form.get('damtom').value;
      this.getDataByRangeTime(damTomId, startTs, endTs);

    }
  }

  ngOnInit() {
    this.isDamTomLoading = true;
    this.fiveDayAgo.setDate(this.fiveDayAgo.getDate() - 4);
    this.form = this.fb.group({
      dateFrom: [this.fiveDayAgo.toISOString()],
      dateTo: [this.now],
      damtom: ['ALL']
    });
    this.initialization();
  }
  ionViewWillEnter() {
    this.initialization();
  }

  initialization() {
    /**
     * Mặc định hiển thị dữ liệu của 5 ngày gần nhất
     * @author viettd
     */

    this.getAllDamtom();
  }
  getAllDamtom() {
    this.baoCaoService.getAllTenantDamtom().subscribe(
      resp => {
        this.damTomList = this.getListDamTomActive(resp);
        // set selected value :
        if (this.damTomList.length > 0) {
          let startTs: any = new Date(Date.parse(this.form.get('dateFrom').value));
          startTs.setHours(0, 0, 0, 0);
          startTs = (Date.parse(startTs.toISOString()));
          const endTs = this.convertEndTs(Date.parse(this.form.get('dateTo').value));
          // let endTs = Date.parse(this.form.get('dateTo').value);
          this.selectedValue = 'ALL';
          this.form.get('damtom').setValue('ALL');
          this.getDataByRangeTime(this.selectedValue, startTs, endTs);
        }
      },
      err => {
        console.log(err);
      },
      () => {
        this.isDamTomLoading = false;
      }
    );
  }
  getListDamTomActive(damtomList) {
    const listDamTom = [];
    damtomList.forEach(damtom => {
      if (damtom.active) {
        listDamTom.push(damtom);
      }
    });
    return listDamTom;
  }

  getDataByRangeTime(damtomId: string, startTs: number, endTs: number) {
    this.setLoading();
    this.getDamtomKeyDlcambienData(damtomId, startTs, endTs);
    this.getDamtomCanhBaoData(damtomId, startTs, endTs);
  }

  // get data for line chart
  getDamtomKeyDlcambienData(damtomId: string, startTs: number, endTs: number) {
    for (const x of keysParam) {
      this.data = [];
      this.chartLabel = [];
      this.baoCaoService.getDamtomKeyDlcambienData(damtomId, x, startTs, endTs).subscribe(
        resp => {
          resp.forEach(data => {
            data.series.forEach(serie => {
              if (!this.chartLabels.includes(serie.name)) { this.chartLabels.push(serie.name); }
              if (x === 'Lux') {
                this.dataset.data.push(Math.round(serie.value));
              } else {
                this.dataset.data.push(Math.round(serie.value * 10) / 10);
              }
            });
            this.datasets.push({ ...this.dataset });
            this.dataset = {
              data: [],
              name: '',
              type: 'line',
              smooth: true,
              lineStyle: {
                width: 3,
              },
              showSymbol: false
            };
          });
          this.setDataChar(x, this.chartLabels, this.datasets);
          this.chartLabels = [];
          this.datasets = [];
        },
        error => {
        },
        () => {
        }
      );
    }
  }

  setDataChar(key, chartLabels, dataset) {
    switch (key) {
      case 'Humidity':
        this.humidityChartLabels = [...chartLabels];
        this.humidityDatasets = [...dataset];
        this.isLoadingsalinity = false;
        this.humChartOption = {
          textStyle: {
            fontStyle: 'normal',
            fontFamily: 'Inter var',
            fontSize: 16
          },
          grid: {
            left: '3%',
            right: '4%',
            containLabel: true,
          },
          title: {
            text: 'Độ ẩm trung bình',
            left: 40,
            top: 10,
            textStyle: {
              fontStyle: 'normal',
              fontFamily: 'Inter var',
              fontWeight: 500,
              fontSize: 20,
              color: '#fff'
            },
          },
          legend: {
            x: 'center',
            bottom: 10,
            type: 'scroll',
            itemGap: 10,
            // data: this.dataLegend
          },
          tooltip: {
            trigger: 'axis',
            backgroundColor: '#0b0e10',
            // position: ['15%', '20%'],
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
            textStyle: {
              fontSize: 10,
              color: 'rgba(255, 255, 255, 1)',
              fontWeight: 'bold'
            },
            borderWidth: 0,
            confine: true
          },
          xAxis: {
            data: this.humidityChartLabels,
            silent: false,
            axisLabel: {
              fontSize: 14,
              fontFamily: 'Inter var',
              color: '#fff'
            },
            splitLine: {
              show: false,
            },
            axisTick: {
              show: true,
              length: 3,
              interval: 0,
              inside: false,
              alignWithLabel: true,
            },
          },
          yAxis: {
            axisLabel: {
              fontSize: 14,
              fontFamily: 'Inter var',
              color: '#fff'
            },
          },
          series: this.humidityDatasets,
        };
        break;
      case 'Lux':
        this.luxChartLabels = [...chartLabels];
        this.luxDataset = [...dataset];
        this.isLoadingPH = false;
        this.luxChartOption = {
          textStyle: {
            fontStyle: 'normal',
            fontFamily: 'Inter var',
            fontSize: 16
          },
          grid: {
            left: '3%',
            right: '4%',
            // bottom: '3%',
            containLabel: true,
          },
          title: {
            text: 'Ánh sáng trung bình',
            left: 40,
            top: 10,
            textStyle: {
              fontStyle: 'normal',
              fontFamily: 'Inter var',
              fontWeight: 500,
              fontSize: 20,
              color: '#fff'
            },
          },
          legend: {
            x: 'center',
            // y: 'bottom',
            bottom: 10,
            type: 'scroll',
            itemGap: 10,
            // data: this.dataLegend
          },
          tooltip: {
            trigger: 'axis',
            backgroundColor: '#0b0e10',
            // position: ['15%', '20%'],
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
            textStyle: {
              fontSize: 10,
              color: 'rgba(255, 255, 255, 1)',
              fontWeight: 'bold'
            },
            borderWidth: 0,
            confine: true
          },
          xAxis: {
            data: this.luxChartLabels,
            silent: false,
            splitLine: {
              show: false,
            },
            axisLabel: {
              fontSize: 14,
              fontFamily: 'Inter var',
              color: '#fff'
            },
            axisTick: {
              show: true,
              length: 3,
              interval: 0,
              inside: false,
              alignWithLabel: true,
            },
          },
          yAxis: {
            axisLabel: {
              fontSize: 14,
              fontFamily: 'Inter var',
              color: '#fff'
            },
          },
          series: this.luxDataset,
        };
        break;
      case 'Temperature':
        this.TempChartLabels = [...chartLabels];
        this.Tempdatasets = [...dataset];
        this.isLoadingTemp = false;
        this.tempChartOption = {
          lineStyle: {
            width: 2
          },
          textStyle: {
            fontStyle: 'normal',
            fontFamily: 'Inter var',
            fontSize: 16
          },
          grid: {
            left: '3%',
            right: '4%',
            // bottom: '3%',
            containLabel: true,
          },
          title: {
            text: 'Nhiệt độ trung bình',
            left: 40,
            top: 10,
            textStyle: {
              fontStyle: 'normal',
              fontFamily: 'Inter var',
              fontWeight: 500,
              fontSize: 20,
              color: '#fff'
            },
          },
          legend: {
            x: 'center',
            // y: 'bottom',
            bottom: 10,
            // data: this.dataLegend,
            type: 'scroll',
            itemGap: 10
          },
          tooltip: {
            trigger: 'axis',
            backgroundColor: '#0b0e10',
            // position: ['15%', '20%'],
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
            textStyle: {
              fontSize: 10,
              color: 'rgba(255, 255, 255, 1)',
              fontWeight: 'bold'
            },
            borderWidth: 0,
            confine: true
          },
          xAxis: {
            data: this.TempChartLabels,
            silent: false,
            splitLine: {
              show: false,
            },
            axisLabel: {
              fontSize: 14,
              fontFamily: 'Inter var',
              color: '#fff'
            },
            axisTick: {
              show: true,
              length: 3,
              interval: 0,
              inside: false,
              alignWithLabel: true,
            },
          },
          yAxis: {
            axisLabel: {
              fontSize: 14,
              fontFamily: 'Inter var',
              color: '#fff'
            },
          },
          series: this.Tempdatasets,
        };
        break;
    }
  }
  setLoading() {
    this.isLoadingTemp = true;
    this.isLoadingPH = true;
    this.isLoadingORP = true;
    this.isLoading = true;
    this.isLoadingsalinity = true;
  }
  damTomChange() {
    let startTs: any = new Date(Date.parse(this.form.get('dateFrom').value));
    startTs.setHours(0, 0, 0, 0);
    startTs = (Date.parse(startTs.toISOString()));
    const endTs = this.convertEndTs(Date.parse(this.form.get('dateTo').value));
    // let endTs = Date.parse(this.form.get('dateTo').value);
    const damtomId = this.form.get('damtom').value;
    // this.fetchDataSingle(damtomId, startTs, endTs);
    this.getDataByRangeTime(damtomId, startTs, endTs);
  }

  async getDamtomCanhBaoData(damtomId: string, startTs: number, endTs: number) {
    await this.baoCaoService.getDamtomCanhBaoData(damtomId, startTs, endTs).toPromise().then(
      dataCanhBaos => {
        this.data = [];
        this.warningChartLabels = [];
        dataCanhBaos.forEach(
          dataCanhBao => {
            this.data.push(dataCanhBao.value);
            this.warningChartLabels.push(dataCanhBao.name);
          }
        );
        this.dataBieudo = this.data;
        this.warningChartDataset = [{
          data: [...this.data],
          type: 'bar',
          barMaxWidth: 40,
          barGap: '100%',
          name: 'Tổng số lần cảnh báo'
        }];
        this.isLoading = false;
      },
      error => {
        console.log(error);
      },
    );

    damtomId === 'ALL' ?
      await this.baoCaoService.getTableBcKetNoi(null, startTs, endTs).toPromise().then(
        value => {
          this.data = [...this.dataBieudo];
          this.bcKetNoi = value;
          for (let i = 0; i < this.data.length; i++) {
            if (value[i].data.LUX === undefined) {
              value[i].data.LUX = 0;
            }
            if (value[i].data.HUMIDITY === undefined) {
              value[i].data.HUMIDITY = 0;
            }
            if (value[i].data.TEMPERATURE === undefined) {
              value[i].data.TEMPERATURE = 0;
            }
            this.data[i] = this.data[i];
          }
          this.warningChartDataset = [{
            data: [...this.data],
            type: 'bar',
            barMaxWidth: 40,
            barGap: '100%',
            name: 'Tổng số lần cảnh báo'
          }];
          this.isLoading = false;
        }

      ) :
      await this.baoCaoService.getTableBcKetNoi(damtomId, startTs, endTs).toPromise().then(
        value => {
          this.data = [...this.dataBieudo];
          this.bcKetNoi = value;
          for (let i = 0; i < this.data.length; i++) {
            if (value[i].data.LUX === undefined) {
              value[i].data.LUX = 0;
            }
            if (value[i].data.HUMIDITY === undefined) {
              value[i].data.HUMIDITY = 0;
            }
            if (value[i].data.TEMPERATURE === undefined) {
              value[i].data.TEMPERATURE = 0;
            }
            this.data[i] = this.data[i];
          }
          this.warningChartDataset = [{
            data: [...this.data],
            type: 'bar',
            barMaxWidth: 40,
            barGap: '100%',
            name: 'Tổng số lần cảnh báo'
          }];
          this.isLoading = false;

        }

      );
    this.chartOption = {
      textStyle: {
        fontStyle: 'normal',
        fontFamily: 'Inter var',
        fontSize: 16
      },
      grid: {
        left: '5%',
        right: '5%',
        containLabel: true,
      },
      title: {
        text: 'Tổng số lần cảnh báo',
        top: 10,
        left: 40,
        textStyle: {
          fontStyle: 'normal',
          fontFamily: 'Inter var',
          fontWeight: 500,
          fontSize: 20,
          color: '#fff'
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0b0e10',
        // position: ['15%', '20%'],
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
        textStyle: {
          fontSize: 10,
          color: 'rgba(255, 255, 255, 1)',
          fontWeight: 'bold'
        },
        borderWidth: 0,
        confine: true
      },
      xAxis: {
        data: this.warningChartLabels,
        type: 'category',
        nameRotate: 45,
        axisTick: {
          show: true,
          length: 3,
          interval: 0,
          inside: false,
          alignWithLabel: true,
        },
        axisLabel: {
          interval: 'auto',
          show: true,
          inside: false,
          // margin: 8,
          fontSize: 14,
          fontFamily: 'Inter var',
          color: '#fff'
        },
        minorTick: {
          splitNumber: 5
        },
        boundaryGap: true,
        silent: false,
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        axisLabel: {
          fontSize: 14,
          fontFamily: 'Inter var',
          color: '#fff'
        },
      },
      series: this.warningChartDataset[0],
    };
  }

  convertEndTs(endTs: number) {
    const x = new Date(endTs);
    x.setHours(24, 0, 0, 0); // set x = thời điểm 0h ngày hôm sau

    return x.getTime() > Date.now() ? Date.now() : x.getTime();
  }
  sliderClick() {
    this.selectHour = !this.selectHour;
    // this.fromDate = moment(new Date()).startOf('date').toDate().toISOString();
  }
  doRefresh(event) {
    setTimeout(() => {
      this.ionViewWillEnter();
      event.target.complete();
    }, 1000);
  }
  goTop() {
    this.gotoTop.scrollToTop(0);
  }
  logScrolling(event) {
    if (event.detail.scrollTop === 0) {
      this.isGoTop = false;
    }
    else {
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
