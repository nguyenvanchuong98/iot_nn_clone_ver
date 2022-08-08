import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DieuKhienService } from 'src/app/core/services/dieu-khien.service';

@Injectable({
    providedIn: 'root'
})
export class GroupRpcValidators {

    constructor(private deviceRpcService: DieuKhienService) { }

    groupRpcNameValidator(damTomId: string, time: number = 500): AsyncValidatorFn {
        return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
            const query = `type=ADD_ENTITY&damTomId=${damTomId}&groupRpcName=${encodeURI(control.value)}`;
            return timer(time).pipe(
                switchMap(() => this.deviceRpcService.validateGroupRpc(query)),
                map(res => {
                    if (res) {
                        return { uniqueGroupRpcName: true };
                    }
                })
            );
        };
    }

    editGroupRpcNameValidator(damTomId: string, id: string, time: number = 500): AsyncValidatorFn {
        return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
            const query = `type=EDIT_ENTITY&damTomId=${damTomId}&groupRpcName=${encodeURI(control.value)}`;
            return timer(time).pipe(
                switchMap(() => this.deviceRpcService.validateGroupRpc(query)),
                map(res => {
                    if (res) {
                        return { uniqueGroupRpcName: true };
                    }
                })
            );
        };
    }
}
