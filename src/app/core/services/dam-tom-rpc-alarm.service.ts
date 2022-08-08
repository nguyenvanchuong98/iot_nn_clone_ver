import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DamTomRpcAlarm, DamTomRpcAlarmCreateDto, RpcAlarm } from "src/app/shared/models/dam-tom-rpc-alarm";
import { environment as env } from 'src/environments/environment';
import { defaultHttpOptionsFromConfig, RequestConfig } from "../http/http-utils";

@Injectable({
    providedIn: 'root'
})
export class DamTomRpcAlarmService {

    constructor(
        private http: HttpClient
    ) { }

    public getAll(damTomId: string, config?: RequestConfig): Observable<DamTomRpcAlarm[]> {
        return this.http.get<DamTomRpcAlarm[]>(env.backendBaseUrl + `/api/damtom-rpc-alarm/` + damTomId);
    }

    public getById(damTomId: string, alarmType: string, config?: RequestConfig): Observable<RpcAlarm> {
        alarmType = encodeURIComponent(alarmType);
        return this.http.get<RpcAlarm>(env.backendBaseUrl + `/api/damtom-rpc-alarm?damTomId=${damTomId}&alarmType=${alarmType}`, defaultHttpOptionsFromConfig(config));
    }

    public saveAlarm(alarm: DamTomRpcAlarmCreateDto, config?: RequestConfig) {
        return this.http.post<any>(env.backendBaseUrl + `/api/damtom-rpc-alarm`, alarm, defaultHttpOptionsFromConfig(config));
    }
    public activeAlarm(damtomId:string,deviceProfile:RpcAlarm){
        return this.http.put<any>(env.backendBaseUrl+`/api/damtom-rpc-alarm/active/${damtomId}`,deviceProfile);
    }
    public deleteAlarm(damTomId: string, alarmId: string): Observable<any> {
        const params = new HttpParams()
            .set('damTomId', damTomId)
            .set('alarmId', alarmId)
            ;
        return this.http.delete<any>(env.backendBaseUrl + `/api/damtom-rpc-alarm`, { params: params });
    }
}