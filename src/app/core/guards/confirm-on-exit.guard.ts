///
/// Copyright © 2016-2021 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/core/core.state';
import { AuthState } from 'src/app/core/auth/auth.models';
import { selectAuth } from 'src/app/core/auth/auth.selectors';
import { take } from 'rxjs/operators';
// import { DialogService } from 'src/app/core/services/dialog.service';
import { isDefined } from '../utils';
import { AlertController } from '@ionic/angular';
import _ from 'lodash';

export interface HasConfirmForm {
  confirmForm(): FormGroup;
}

export interface HasDirtyFlag {
  isDirty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmOnExitGuard implements CanDeactivate<HasConfirmForm & HasDirtyFlag> {

  constructor(private store: Store<AppState>, private alertCtrl: AlertController,) { }

  canDeactivate(component: HasConfirmForm & HasDirtyFlag, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let isDirty = false;
    _.each(component, (e, i) => {
      if (e instanceof FormGroup) {
        if (e.dirty)
        {
          isDirty = true;
        }
      }
    });

    if (!isDirty) { return true; }

    return new Promise<boolean>(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header: 'Bạn chắc chắn muốn Huỷ?',
        message: 'Tất cả dữ liệu sẽ không được lưu',
        buttons: [
          {
            text: 'Huỷ bỏ',
            role: 'cancel',
            handler: () => {
              resolve(false);
            }
          }, {
            text: 'Xác nhận',
            handler: () => {
              resolve(true);
            }
          }
        ]
      });
      await alert.present();
    });

    // let auth: AuthState = null;
    // this.store.pipe(select(selectAuth), take(1)).subscribe(
    //   (authState: AuthState) => {
    //     auth = authState;
    //   }
    // );

    // if (auth && auth.isAuthenticated) {
    //   let isDirty = false;
    //   if (component.confirmForm) {
    //     const confirmForm = component.confirmForm();
    //     if (confirmForm) {
    //       isDirty = confirmForm.dirty;
    //     }
    //   } else if (isDefined(component.isDirty)) {
    //     isDirty = component.isDirty;
    //   }
    //   console.log('isDirty ---------- ', isDirty);
    //   if (isDirty) {
    //     // return this.dialogService.confirm(
    //     //   this.translate.instant('confirm-on-exit.title'),
    //     //   this.translate.instant('confirm-on-exit.html-message')
    //     // );
    //   }
    // }
    // return true;
  }
}
