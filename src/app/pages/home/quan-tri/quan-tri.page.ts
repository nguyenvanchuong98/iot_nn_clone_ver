import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-quan-tri',
  templateUrl: './quan-tri.page.html',
  styleUrls: ['./quan-tri.page.scss'],
})
export class QuanTriPage implements OnInit {

  closed$ = new Subject<any>();
  showTabs = true;
  pages = [
    // '/home/quan-tri/menu',
    // '/home/quan-tri/tai-khoan',
    // '/home/quan-tri/vai-tro',
    // '/home/quan-tri/dam-tom',
    // '/home/quan-tri/lich-su-truy-cap'
  ];

  page = 'thong-tin-ca-nhan';

  constructor(
    private _router: Router,
  ) { }

  ngOnInit() {
    // this._router.events.pipe(
    //   filter(e => e instanceof NavigationEnd),
    //   takeUntil(this.closed$)
    // ).subscribe(event => {
    //   this.showTabs = this.pages.indexOf(event['urlAfterRedirects']) >= 0;
    //   this.page = event['urlAfterRedirects'].replace('/home/quan-tri/', '');
    // });
  }

  ngOnDestroy() {
    this.closed$.next();
  }

  segmentChanged(ev: any) {
    const tab = ev?.detail?.value;
    this._router.navigate(['/home/quan-tri/' + tab]);
  }
  openThongTinCaNhan(){
    this._router.navigate(['/home/quan-tri/thong-tin-ca-nhan'])
  }
}
