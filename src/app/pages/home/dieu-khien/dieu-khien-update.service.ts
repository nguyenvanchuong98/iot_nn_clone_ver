import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { DieuKhienDamTom, ZoneDieuKhienUpdate } from "./dieu-khien-update.model";
import { environment as env } from 'src/environments/environment';
import { map, tap } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class DieuKhienServiceUpdate {
    private _dieuKhienDamToms = new BehaviorSubject<DieuKhienDamTom[]>([]);

    get dieuKhienDamToms() {
        return this._dieuKhienDamToms.asObservable();
    }

    constructor(
        private http: HttpClient
    ){}

    //fetch all dam tom chua list zone dieu khien
    fetchDieuKhienDamToms() {
        return this.http
        .get<DieuKhienDamTom[]>(env.backendBaseUrl + '/api/rpc-device/all')
        .pipe(
            map(resData => {
                return resData;
            }),
            tap(dataDieuKhien => {
                this._dieuKhienDamToms.next(dataDieuKhien);
            })
        );
    }
    // fetch one dam tom
    fetchDieuKhienDamTomById(damTomId: string) {
        return this.http.get<ZoneDieuKhienUpdate[]>(env.backendBaseUrl + `/api/rpc-device/zone?damTomId=${damTomId}`);
    }
}