import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment as env } from 'src/environments/environment';
import { GiamSatDamTom, GiamSatDevice, DeviceType } from './giam-sat-update.model';
@Injectable({
    providedIn: 'root'
})

export class GiamSatServiceUpdate {
    data: GiamSatDamTom = {} as GiamSatDamTom;

    private _dataDamToms = new BehaviorSubject<GiamSatDamTom[]>([]);
    public _dataDamTom = new BehaviorSubject<GiamSatDamTom>(this.data);

    get dataDamToms() {
        return this._dataDamToms.asObservable();
    }

    get dataDamTom() {
        return this._dataDamTom.asObservable();
    }

    constructor(
        private http: HttpClient
    ){}

    //fetch data cua tat ca dam tom lan dau vao app
    //fetchDamToms 
    fetchDamToms() {
        return this.http
        .get<GiamSatDamTom[]>(env.backendBaseUrl + '/api/gs-damtom')
        .pipe(
            map(resData => {
                return resData;
            }),
            tap(damtoms => {
                this._dataDamToms.next(damtoms);
            })
        );
    }
    //get du lieu can update cua dam tom hien tai sau 20s
    //getDamTom

    getDamTomById(damTomId: string) {
        return this.http
        .get<GiamSatDamTom>(env.backendBaseUrl + `/api/gs-damtom?damtomId=${damTomId}`);
    }
    
}