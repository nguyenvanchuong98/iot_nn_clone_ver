import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, map, skip } from 'rxjs/operators';
import { selectIsAuthenticated, selectIsUserLoaded } from './core/auth/auth.selectors';
import { AuthService } from './core/auth/auth.service';
import { AppState } from './core/core.state';

import {Platform} from "@ionic/angular";
import { Plugins, Capacitor } from "@capacitor/core";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private store: Store<AppState>,
    private authService: AuthService,
    private platform: Platform,
    
  ) {
    this.setupAuth();
    this.initializeApp();
  }

  initializeApp(){
    this.platform.ready().then(()=>{
      if(Capacitor.isPluginAvailable('SplashScreen')){
        Plugins.SplashScreen.hide();
      }
    })
    // NB - set mac dinh che do dark mode 
    document.body.setAttribute('color-theme','dark');
  }
  
  setupAuth() {
    combineLatest([
      this.store.pipe(select(selectIsAuthenticated)),
      this.store.pipe(select(selectIsUserLoaded))]
    ).pipe(
      map(results => ({ isAuthenticated: results[0], isUserLoaded: results[1] })),
      distinctUntilChanged(),
      filter((data) => data.isUserLoaded),
      skip(1),
    ).subscribe((data) => {
      this.authService.gotoDefaultPlace(data.isAuthenticated);
    });
    this.authService.reloadUser();
  }
}
