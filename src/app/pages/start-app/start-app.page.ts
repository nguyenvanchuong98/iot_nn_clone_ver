import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-start-app',
  templateUrl: './start-app.page.html',
  styleUrls: ['./start-app.page.scss'],
})
export class StartAppPage implements OnInit {

  constructor(
      private router: Router
  ) { }

  ngOnInit() {
  }
  goToLogin(){
    this.router.navigateByUrl('/login');
  }
}
