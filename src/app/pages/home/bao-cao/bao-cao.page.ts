import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bao-cao',
  templateUrl: './bao-cao.page.html',
  styleUrls: ['./bao-cao.page.scss'],
})
export class BaoCaoPage implements OnInit {

  giamsatIconUrl = '/assets/icon/giamsatrs.png';
  canhbaoIconUrl = '/assets/icon/canhbaors.png';
  thongbaoIconUrl = '/assets/icon/thongbaors.png';
  cambienIconUrl = '/assets/icon/cambien.png';
  tonghopIconUrl = '/assets/icon/tonghop.PNG';
  constructor() { }

  ngOnInit() {
  }

}
