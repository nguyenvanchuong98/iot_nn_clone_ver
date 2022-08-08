import { AlarmDeleteDto, AlarmDto } from './../../shared/models/giamsat.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment as env } from 'src/environments/environment';
import { defaultHttpOptionsFromConfig, RequestConfig } from '../http/http-utils';
import { AllDevice, DeviceProfileAlarmDto, DeviceProfileWithTime, LuatCBDto } from 'src/app/shared/models/luatcanhbao.model';

@Injectable({
  providedIn: 'root'
})
export class LuatCanhBaoService {

  constructor(
    private http: HttpClient
  ) { }
  // Lấy danh sách luật cảnh báo
  public getAllLuatCanhBao(id: string): Observable<any>{
    // const params = new HttpParams().set('id',id);
    // id là đầm tôm id
    return this.http.get<any>(env.backendBaseUrl + `/api/alarm-dt/${id}`);
  }
  public saveAlarm(alarmDto: AlarmDto, config?: RequestConfig): Observable<any> {
    return this.http.post<any>(env.backendBaseUrl + `/api/alarm-dt/`, alarmDto, defaultHttpOptionsFromConfig(config));
  }
  public getAlarmEdit(alarmId: string, config?: RequestConfig): Observable<any> {
    return this.http.get<any>(env.backendBaseUrl + `/api/alarm-dt/alarm/${alarmId}`, defaultHttpOptionsFromConfig(config));
  }
  // public getLuatCanhBaoById(id: string): Observable<any>{
  //   return this.http.get<any>(env.backendBaseUrl + `/api/alarm-dt/alarm/${id}`);
  // }
  public deleteAlarm(alarmDeleteDto: AlarmDeleteDto, config?: RequestConfig): Observable<any> {
    return this.http.post<any>(env.backendBaseUrl + `/api/alarm-dt/delete`, alarmDeleteDto, defaultHttpOptionsFromConfig(config));
  }

  /*Write by ChuongNV of DFT - 16/6/2021*/
  // Danh sachs luat cua dam
  public getListLuatbyIdDam(id: string): Observable<DeviceProfileWithTime[]>{
    return this.http.get<DeviceProfileWithTime[]>(env.backendBaseUrl + `/api/damtom-alarm/v2/${id}`);
  }
  public getDetailLuat(idDam: string, alarmId: string): Observable<DeviceProfileAlarmDto>{
    const params = new HttpParams()
    .set('alarmId', alarmId);
    return this.http.get<DeviceProfileAlarmDto>(env.backendBaseUrl + `/api/dt-alarm-v2/${idDam}`, {params});
  }
  createLuatCb(luatCbDto: LuatCBDto){
    return this.http.post(env.backendBaseUrl + '/api/dt-alarm-v2', luatCbDto);
  }
  updateLuatCb(luatCbDto: LuatCBDto, alarmTypeInput: string){
    // const params = new HttpParams().set('oldAlarmType', encodeURIComponent(alarmTypeInput));
    return this.http.put(`${env.backendBaseUrl}/api/dt-alarm-v2?oldAlarmType=${encodeURIComponent(alarmTypeInput)}`, luatCbDto);
  }
  activeLuat(idDam: string, idLuat: string, status: string){
    const params = new HttpParams().set('damTomId', idDam).set('alarmId', idLuat).set('active', status);
    return this.http.put(`${env.backendBaseUrl}/api/dt-alarm-v2/active`, null, {params});
  }
  checkTrungTenLuat(damtomId: string, alarmType: string)
  {
    const params = new HttpParams()
    .set('damTomId', damtomId)
    .set('alarmType', encodeURIComponent(alarmType));
    return this.http.get(env.backendBaseUrl + '/api/damtom-alarm/exist', {params});
  }
  deleteLuatCB(idDam: string, tenLuat: string){
    const params = new HttpParams()
    .set('damTomId', idDam)
    .set('alarmId', tenLuat);
    return this.http.delete(env.backendBaseUrl + '/api/dt-alarm-v2', {params});
  }
  getAllDevice(damtomId: string): Observable<AllDevice>{
    const params = new HttpParams().set('damTomId', damtomId);
    return this.http.get<AllDevice>(env.backendBaseUrl + '/api/dam-tom/all-device', {params});
  }
}
