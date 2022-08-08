import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DeviceRpcZone, DeviceZone } from "src/app/shared/models/dieukhien.model";
import { environment as env } from 'src/environments/environment';
import { DeviceEntity } from "./quan-ly-zone.service";

@Injectable({
    providedIn: 'root'
})
export class DeviceService {

    constructor(private http: HttpClient) { }

    getDeviceTelemetryType(id: string): Observable<any> {
        return this.http.get<any>(`${env.backendBaseUrl}/api/plugins/telemetry/DEVICE/${id}/keys/timeseries`);
    }
    getDeviceWithZone(damtomIdInput:string):Observable<DeviceZone[]>{
        return this.http.get<DeviceZone[]>(`${env.backendBaseUrl}/api/damtom-zone?damtomId=${damtomIdInput}`);
    }
    getDeviceRpcWithZone(damtomIdInput:string):Observable<DeviceRpcZone[]>{
        return this.http.get<DeviceRpcZone[]>(`${env.backendBaseUrl}/api/rpc-device/zone?damTomId=${damtomIdInput}`);
    }
    // Ds tat ca thiet bi( sensor va rpc) cua nha vuon
    getAllDeviceNV(idNhaVuon: string): Observable<DeviceEntity[]>{
        return this.http.get<DeviceEntity[]>(env.backendBaseUrl + `/api/dam-tom/thiet-bi?damtomId=${idNhaVuon}`);
    }
}
