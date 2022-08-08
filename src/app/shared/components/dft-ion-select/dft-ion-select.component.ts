import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-dft-ion-select',
  templateUrl: './dft-ion-select.component.html',
  styleUrls: ['./dft-ion-select.component.scss'],
})
export class DftIonSelectComponent implements OnInit {

  @Input() control: FormControl | any;
  @Input() options: {
    value: any;
    display: string;
    icon?: string;
  }[];
  @Input() placeholder: string;
  @Input() icon: string;
  @Input() header: string;
  @Input() fontSize: string;
  @Input() disable: boolean;
  customPopoverOptions: any;
  constructor() { }

  ngOnInit() {
    this.customPopoverOptions = {
      header: `${this.header}`,
      cssClass: 'my-custom-popover',
    };
  }

}
