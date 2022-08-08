import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Camera } from '../giam-sat-update.model';

@Component({
  selector: 'app-giam-sat-camera',
  templateUrl: './giam-sat-camera.component.html',
  styleUrls: ['./giam-sat-camera.component.scss'],
})
export class GiamSatCameraComponent implements OnInit {
  @Input() damTomIdInput: string;
  @Input() listCamera: Camera[];
  accordionExpanded = true;
  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnChanges() {
    if (!!this.listCamera) {
      if (this.listCamera.length === 0) {
        this.accordionExpanded = false;
      } else {
        this.accordionExpanded = true;
      }
    }
  }
  toggleAccordion() {
    this.accordionExpanded = !this.accordionExpanded;
  }
  xemAllCamera() {
    this.router.navigate(['/home/camera']);
  }
  routerSpecificCamera(cameraId: string) {
    this.router.navigate(['/home/camera'], {queryParams: {camId: cameraId}});
  }
}
