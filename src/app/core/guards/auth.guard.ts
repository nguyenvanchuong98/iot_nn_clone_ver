import { Inject, Injectable, NgZone } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { select, Store } from '@ngrx/store';
import { AppState } from '../core.state';
import { selectAuth } from '../auth/auth.selectors';
import { catchError, map, mergeMap, skipWhile, take } from 'rxjs/operators';
import { AuthState } from '../auth/auth.models';
import { forkJoin, Observable, of } from 'rxjs';
import { enterZone } from 'src/app/core/operator/enterZone';
import { Authority } from 'src/app/shared/models/authority.enum';
import { ToastController } from '@ionic/angular';
// import { DialogService } from 'src/app/core/services/dialog.service';
// import { UtilsService } from 'src/app/core/services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private store: Store<AppState>,
    private authService: AuthService,
    private toastCtl: ToastController,
    private router: Router,
    private zone: NgZone) { }

  getAuthState(): Observable<AuthState> {
    return this.store.pipe(
      select(selectAuth),
      skipWhile((authState) => !authState || !authState.isUserLoaded),
      take(1),
      enterZone(this.zone)
    );
  }

  canActivate(next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {

    return this.getAuthState().pipe(
      mergeMap((authState) => {
        const url: string = state.url;
        let lastChild = state.root;
        const urlSegments: string[] = [];
        if (lastChild.url) {
          urlSegments.push(...lastChild.url.map(segment => segment.path));
        }
        while (lastChild.children.length) {
          lastChild = lastChild.children[0];
          if (lastChild.url) {
            urlSegments.push(...lastChild.url.map(segment => segment.path));
          }
        }
        const path = urlSegments.join('.');
        const data = lastChild.data || {};
        const params = lastChild.params || {};

        if (!authState.isAuthenticated) {
          this.authService.redirectUrl = url;
          return of(this.authService.defaultUrl(false));
        } else {
          const defaultUrl = this.authService.defaultUrl(true, authState, path, params);
          if (defaultUrl) {
            return of(defaultUrl);
          } else {
            if (!data || !data.auth) { return of(true); }

            const authority = authState.authUser.scopes;
            const filteredArray = data.auth.filter(value => authority.includes(value));

            if (filteredArray.length <= 0) {
              this.toastCtl.create({
                message: 'Không có quyền truy cập !',
                color: 'danger',
                duration: 3000
              }).then(toastCtrl => {
                toastCtrl.present();
              })

              if (this.router.url === '/login' || this.router.url === '/') {
                this.router.navigate(['/home/quan-tri']);
              }

              return of(false);
            } else {
              return of(true);
            }
          }
        }
      }),
      catchError((err => { console.error(err); return of(false); }))
    );
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
    return this.canActivate(route, state);
  }
}
