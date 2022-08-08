import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DamTom } from 'src/app/shared/models/giamsat.model';
import { DataHDTB, DataHDTBTable, NotifyReport, ReportMultiData, ReportSingleData } from 'src/app/shared/models/report.model';
import { environment as env } from 'src/environments/environment';
import { RequestConfig, defaultHttpOptionsFromConfig } from '../http/http-utils';
import { DamTomSchedule } from './report-schedule.service';

const API_LINK = `${env.backendBaseUrl}`;
const BC_KETNOICB_API = '/api/bc-ket-noi';
@Injectable({
  providedIn: 'root'
})
export class BaoCaoService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   *  Báo cáo dữ liệu giám sát
   * @param key key truyền vào các đầm để lấy dữ liệu
   * @param startTs : khoảng thời giam bắt đầu
   * @param endTs :  khoảng thời gian kết thúc
   * @returns dữ liệu giám sát của tất cả các đần
   */
  public getBcDlgiamsatData(key: string, startTs: number, endTs: number): Observable<ReportMultiData[]> {
    const query = `/api/bc-dlgiamsat?key=${key}&startTs=${startTs}&endTs=${endTs}`;
    return this.http.get<ReportMultiData[]>(`${API_LINK}${query}`);
  }

  /**
   * Báo cáo cảnh báo
   * @param damtomId
   * @param startTs
   * @param endTs
   * @returns
   */
  public getDamtomBcCanhBaoData(damtomId: string, startTs: number, endTs: number): Observable<ReportSingleData[]> {
    const query = `/api/bc-canhbao/dam-tom?damtomId=${damtomId}&startTs=${startTs}&endTs=${endTs}`;
    return this.http.get<ReportSingleData[]>(`${API_LINK}${query}`);
  }

  public getTenantBcCanhBaoData(startTs: number, endTs: number): Observable<ReportSingleData[]> {
    const query = `/api/bc-canhbao/tenant?&startTs=${startTs}&endTs=${endTs}`;
    return this.http.get<ReportSingleData[]>(`${API_LINK}${query}`);
  }

  /**
   *  Báo cáo thông báo
   * //@param startTs
   * //@param endTs
   * //@returns
   */
   getBcThongBaoChart(damtomId: string, startTs: number, endTs: number): Observable<NotifyReport[]> {
    const query = `/api/bc-gui-ttcb/chart?startTs=${startTs}&endTs=${endTs}&damTomId=${damtomId}`;
    return this.http.get<NotifyReport[]>(`${API_LINK}${query}`);
  }
  getBcThongBaoTable(damtomId: string, startTs: number, endTs: number): Observable<NotifyReport[]> {
    const query = `/api/bc-gui-ttcb/table?startTs=${startTs}&endTs=${endTs}&damTomId=${damtomId}`;
    return this.http.get<NotifyReport[]>(`${API_LINK}${query}`);
  }



  /**
   *  Báo cáo tổng hợp
   *
   */
  public getDamtomCanhBaoData(damtomId: string, startTs: number, endTs: number): Observable<ReportSingleData[]> {
    let query;
    if (damtomId === 'ALL') {
      query = `?startTs=${startTs}&endTs=${endTs}`;
    } else {
      query = `?damtomId=${damtomId}&startTs=${startTs}&endTs=${endTs}`;
    }
    return this.http.get<ReportSingleData[]>(`${API_LINK}/api/bc-tonghop/canh-bao${query}`);
  }

  public getAllTenantDamtom(config?: RequestConfig): Observable<DamTom[]> {
    return this.http.get<DamTom[]>(`${API_LINK}/api/dam-tom/mobi`, defaultHttpOptionsFromConfig(config));
  }

  public getDamtomKeyDlcambienData(damtomId: string, key: string, startTs: number, endTs: number): Observable<ReportMultiData[]> {
    let query;
    if (damtomId === 'ALL') {
      query = `?key=${key}&startTs=${startTs}&endTs=${endTs}`;
    } else {
      query = `?damtomId=${damtomId}&key=${key}&startTs=${startTs}&endTs=${endTs}`;
    }
    return this.http.get<ReportMultiData[]>(`${API_LINK}/api/bc-tonghop/dl-cambien${query}`);
  }

  /**
   * BC ket noi cam bien
   */
  public getChartBcKetNoi(damTomId: string, startTime: number, endTime: number, config?: RequestConfig): Observable<ReportSingleData[]> {
    let query;
    if (damTomId) {
      query = `damTomId=${damTomId}&startTime=${startTime}&endTime=${endTime}`;
    } else {
      query = `startTime=${startTime}&endTime=${endTime}`;
    }
    return this.http.get<ReportSingleData[]>(`${API_LINK}${BC_KETNOICB_API}/chart?${query}`, defaultHttpOptionsFromConfig(config));
  }

  public getTableBcKetNoi(damTomId: string, startTime: number, endTime: number, config?: RequestConfig): Observable<any[]> {
    let query;
    if (damTomId) {
      query = `damTomId=${damTomId}&startTime=${startTime}&endTime=${endTime}`;
    } else {
      query = `startTime=${startTime}&endTime=${endTime}`;
    }
    return this.http.get<any[]>(`${API_LINK}${BC_KETNOICB_API}/table?${query}`, defaultHttpOptionsFromConfig(config));
  }

  public getHDTBReport(key: string, startTs: string, endTs: string): Observable<DataHDTB> {
    const query = `/api/rpc-time-report/bc_tbhd?damtomId=${key}&startTs=${startTs}&endTs=${endTs}`;
    return this.http.get<DataHDTB>(`${API_LINK}${query}`);
  }
  public getHDTBReportTable(key: string, startTs: string, endTs: string): Observable<DataHDTBTable[]> {
    const query = `/api/rpc-time-report/bc_tbhd/table?damtomId=${key}&startTs=${startTs}&endTs=${endTs}`;
    return this.http.get<DataHDTBTable[]>(`${API_LINK}${query}`);
  }
}
