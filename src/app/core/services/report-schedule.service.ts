import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as env } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ReportSchedule, ReportScheduleCreateOrUpdate } from 'src/app/shared/models/report-schedule.model';
import { RequestConfig, defaultHttpOptionsFromConfig } from '../http/http-utils';
import { UsersDft } from 'src/app/shared/models/users-dft.model';
import { PageData } from 'src/app/shared/models/page/page-data';
import { PageLink } from 'src/app/shared/models/page/page-link';

export interface DamTomSchedule {
  id: {id: string, type?: string};
  tenantId: string;
  name: string;
  address?: string;
  note?: string;
  searchText?: string;
  images?: string;
  createdBy: string;
  createdTime: number;
  active: boolean;
  staffs: any[];
}
export interface DamTom{
  id: string;
  tenantId: string;
  name: string;
  address?: string;
  note?: string;
  searchText?: string;
  images?: string;
  createdBy: string;
  createdTime: number;
  active: boolean;
  staffs: any[];
}

/**
 * viettd
 * hard reportName
 */
export const ReportNameMap = [
  {key : 'WARNING_REPORT' , value : 'Báo cáo cảnh báo'},
  {key : 'MONITORING_DATA_REPORT' , value : 'Báo cáo dữ liệu giám sát'},
  {key : 'SENSOR_CONNECTION_REPORT' , value : 'Báo cáo kết nối cảm biến'},
  {key : 'NOTIFICATION_DATA_REPORT' , value : 'Báo cáo thông báo'},
  {key : 'SYNTHESIS_REPORT' , value : 'Báo cáo tổng hợp'}
];
@Injectable({
  providedIn: 'root'
})
export class ReportScheduleService {


  constructor(private http: HttpClient) { }

  // Create ReportSchedule
  public createReportSchedule(newReportSchedule: ReportScheduleCreateOrUpdate, config?: RequestConfig): Observable<ReportSchedule> {
    return this.http.post<ReportSchedule>(env.backendBaseUrl + `/api/report-schedule`, newReportSchedule
      , defaultHttpOptionsFromConfig(config));
  }

  // get List ReportSchedule
  public getListReportSchedule(pageLink: PageLink, config?: RequestConfig): Observable<PageData<ReportSchedule>> {
    return this.http.get<PageData<ReportSchedule>>(env.backendBaseUrl + `/api/report-schedule/${pageLink.toQuery()}`
      , defaultHttpOptionsFromConfig(config));
  }

  // get ReportSchedule
  public getReportSchedule(id: string, config?: RequestConfig): Observable<ReportSchedule> {
    return this.http.get<ReportSchedule>(env.backendBaseUrl + `/api/report-schedule/${id}`
      , defaultHttpOptionsFromConfig(config));
  }


  // Update ReportSchedule
  // tslint:disable-next-line: max-line-length
  public updateReportSchedule(id: string, updateReportSchedule: ReportScheduleCreateOrUpdate, config?: RequestConfig): Observable<ReportSchedule> {
    // tslint:disable-next-line: max-line-length
    return this.http.put<ReportSchedule>(env.backendBaseUrl + `/api/report-schedule/${id}`, updateReportSchedule, defaultHttpOptionsFromConfig(config));
  }

  // Delete ReportSchedule
  public deleteReportSchedule(idReportSchedule: string, config?: RequestConfig) {
    return this.http.delete(env.backendBaseUrl + `/api/report-schedule/${idReportSchedule}`, defaultHttpOptionsFromConfig(config));
  }

  // Get All Damtom cho select box
  public getListDamTom(pageLink: PageLink, config?: RequestConfig): Observable<PageData<DamTomSchedule>> {
    // tslint:disable-next-line: max-line-length
    return this.http.get<PageData<DamTomSchedule>>(env.backendBaseUrl + `/api/dam-tom${pageLink.toQuery()}`, defaultHttpOptionsFromConfig(config));
  }
  // Get Dam Tom
  public getDamTom(damtomId: string, config?: RequestConfig): Observable<DamTomSchedule> {
    return this.http.get<DamTomSchedule>(env.backendBaseUrl + `/api/dam-tom/${damtomId}`, defaultHttpOptionsFromConfig(config));
  }


  // get user cho userSelectbox
  public getAllUser(config?: RequestConfig): Observable<UsersDft[]> {
    return this.http.get<UsersDft[]>(env.backendBaseUrl + `/api/mb-users`, defaultHttpOptionsFromConfig(config));
  }

   // check schedule name ton tai
   public isScheduleNameExist(scheduleId: string, scheduleName: string, config?: RequestConfig): Observable<boolean> {
    let toQuery;
    if (scheduleId == null){
      toQuery = `?name=${scheduleName}`;
    }
    else{
      toQuery = `?scheduleId=${scheduleId}&name=${scheduleName}`;
    }
    // tslint:disable-next-line: max-line-length
    return this.http.get<boolean>(env.backendBaseUrl + `/api/report-schedule/check-name-exist` + toQuery, defaultHttpOptionsFromConfig(config));
  }

  public getAllUsersDft(pageLink: PageLink, config?: RequestConfig): Observable<PageData<UsersDft>> {
    // tslint:disable-next-line: max-line-length
    return this.http.get<PageData<UsersDft>>(env.backendBaseUrl + `/api/users/page${pageLink.toQuery()}`, defaultHttpOptionsFromConfig(config));
  }
  public activeLichXuatBaoCao(id: string, isActive: boolean, config?: RequestConfig): Observable<ReportSchedule> {
    // tslint:disable-next-line: max-line-length
    return this.http.put<ReportSchedule>(env.backendBaseUrl + `/api/report-schedule/active/${id}/${isActive}` , defaultHttpOptionsFromConfig(config));
  }
}
