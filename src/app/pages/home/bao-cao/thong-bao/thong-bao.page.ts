import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { BaoCaoService } from 'src/app/core/services/bao-cao.service';
import { DamTom } from 'src/app/shared/models/giamsat.model';

@Component({
  selector: 'app-thong-bao',
  templateUrl: './thong-bao.page.html',
  styleUrls: ['./thong-bao.page.scss'],
})
export class ThongBaoPage implements OnInit {
  @ViewChild(IonContent) gotoTop: IonContent;
  isGoTop = false;
  form: FormGroup;
  isLoading = false;
  isChangeDam = false;
  now = new Date().toISOString();
  fiveDayAgo = new Date();
  hasData = false;
  chartOption;
  // Data
  dataThongBao = [];
  notiSend = {
    name: 'Notification',
    type: 'bar',
    data: []
  };
  smsSend = {
    name: 'Email',
    type: 'bar',
    data: []
  };
  emailSend = {
    name: 'SMS',
    type: 'bar',
    data: []
  };
  chartData: any[] = [];
  chartLabels: any[] = [];
  isDamTomLoading: boolean;

  invalidDate = false;
  maxFromTo: string = new Date().toISOString();
  damTomList: DamTom[] = [];
  customActionSheetOptions: any = {
    header: 'Chọn đầm tôm',
    cssClass: 'my-custom-action-sheet',
  };
  validateDay() {
    const dateF = new Date(this.form.get('dateTo').value);
    dateF.setDate(dateF.getDate() /*- 1*/);

    const dateFrom = this.form.get('dateFrom').value;
    const dateTo = this.form.get('dateTo').value;
    this.maxFromTo = dateF.toISOString();
    if (dateTo < dateFrom ) {
      // tslint:disable-next-line: triple-equals
      if (dateTo.split('T')[0] != dateFrom.split('T')[0]){
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
      this.fetchData(startTs, endTs);
    }
  }

  constructor(
    private fb: FormBuilder,
    private baoCaoService: BaoCaoService) { }

  ngOnInit() {
    this.isDamTomLoading = true;
    this.fiveDayAgo.setDate(this.fiveDayAgo.getDate() - 4);
    this.form = this.fb.group({
      dateFrom: [this.fiveDayAgo.toISOString()],
      dateTo: [this.now],
      damtom: ''
    });
    // this.isLoading = true;
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
          this.form.get('damtom').setValue(resp[0].id);
          this.fetchData(startTs, endTs);
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
  damTomChange() {
    if (!this.isChangeDam){
      return ;
    }
    let startTs: any = new Date(Date.parse(this.form.get('dateFrom').value));
    startTs.setHours(0, 0, 0, 0);
    startTs = (Date.parse(startTs.toISOString()));
    const endTs = this.convertEndTs(Date.parse(this.form.get('dateTo').value));
    console.log('chagne dt-------day--------------');
    this.fetchData(startTs, endTs);
  }
  fetchData(startTs: number, endTs: number) {
    this.isLoading = true;
    this.notiSend.data = [];
    this.smsSend.data = [];
    this.emailSend.data = [];
    this.chartLabels = [];
    this.baoCaoService.getBcThongBaoTable(this.form.get('damtom').value, startTs, endTs).subscribe(
      dataThongBao => {
        this.dataThongBao = dataThongBao;
      });
    this.baoCaoService.getBcThongBaoChart(this.form.get('damtom').value, startTs, endTs).subscribe(
      chartD => {
        // this.dataThongBao = dataThongBao;
        this.hasData = true;
        chartD.forEach(data => {
          this.chartLabels.push(data.name);
          this.notiSend.data.push(data.series[0].value);
          this.emailSend.data.push(data.series[1].value);
          this.smsSend.data.push(data.series[2].value);
        });
        this.setCharData();
      },
      err => {

      },
      () => {

        this.isLoading = false;
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

  setCharData() {
    this.chartData = [];
    this.chartData.push(this.notiSend);
    this.chartData.push(this.emailSend);
    this.chartData.push(this.smsSend);
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
        text: 'Số lần gửi thông tin cảnh báo',
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
        textStyle: {
          fontSize: 12,
          color: '#fff'
        },
        x: 'center',
        bottom: 10,
        type: 'scroll',
        itemGap: 10,
        padding: 5,
        itemWidth: 25,
        itemHeight: 14,
        align: 'auto',
        orient: 'horizontal',
        left: 'center',
        zlevel: 0,
        z: 4
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
        data: this.chartLabels,
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
      series: this.chartData,
    };
  }
  convertEndTs(endTs: number) {
    const x = new Date(endTs);
    x.setHours(24, 0, 0, 0); // set x = thời điểm 0h ngày hôm sau

    return x.getTime() > Date.now() ? Date.now() : x.getTime();
  }

  doRefresh(event) {
    setTimeout(() => {
      this.isDamTomLoading = true;
      let startTs: any = new Date(Date.parse(this.form.get('dateFrom').value));
      startTs.setHours(0, 0, 0, 0);
      startTs = (Date.parse(startTs.toISOString()));
      const endTs = this.convertEndTs(Date.parse(this.form.get('dateTo').value));
      this.fetchData(startTs, endTs);
      event.target.complete();
    }, 1000);
  }
  // ionViewWillEnter() {
  //   this.isDamTomLoading = true;
  //   let startTs: any = new Date(Date.parse(this.form.get('dateFrom').value));
  //   startTs.setHours(0, 0, 0, 0);
  //   startTs = (Date.parse(startTs.toISOString()));
  //   const endTs = this.convertEndTs(Date.parse(this.form.get('dateTo').value));
  //   this.fetchData(startTs, endTs);
  // }
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
