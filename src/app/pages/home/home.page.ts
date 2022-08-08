import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { FcmService } from '../../core/http/fcm.service';
import { Plugins } from '@capacitor/core';
const { App } = Plugins;
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  closed$ = new Subject<any>();
  showTabs = true;
  activeTab = 'giam-sat';
  pages = [
    '/home/dieu-khien',
    '/home/giam-sat',
    '/home/camera',
    '/home/quan-tri/menu',
  ];

  constructor(
    private platform: Platform,
    private fcmService: FcmService,
    private backgroundMode: BackgroundMode,
    // tslint:disable-next-line: variable-name
    private _router: Router) {
  }
  ngOnInit() {
    this._router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.closed$)
    ).subscribe(event => {
      // tslint:disable-next-line: no-string-literal
      const url = event['urlAfterRedirects'].split('?')[0];
      this.showTabs = this.pages.indexOf(url) >= 0;
      this.activeTab = this.showTabs ? url.split('/')[2] : this.activeTab;
    });

    this.platform.backButton.subscribeWithPriority(-1, (processNextHandler) => {
      if (this._router.url.split('?')[0] === '/home/dieu-khien') {
        this.backgroundMode.moveToBackground();
        return;
      }

      if (!this.pages.includes(this._router.url)) {
        return;
      }
      this.backgroundMode.moveToBackground();
    });
  }
  ionViewWillEnter() {
    this.fcmService.initPush();
  }
  ngOnDestroy() {
    this.closed$.next();
  }

  onTabChange(event) {
    this.activeTab = event;
    this._router.navigate([`/home/${this.activeTab}`]);
  }
}
