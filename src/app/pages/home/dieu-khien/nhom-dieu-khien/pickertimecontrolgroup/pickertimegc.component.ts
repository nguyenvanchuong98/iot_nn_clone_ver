import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-pickertimegc',
  templateUrl: './pickertimegc.component.html',
  styleUrls: ['./pickertimegc.component.scss'],
})
export class PickertimeGroupControlComponent implements OnInit {
  numberSelect: Array<number> = [];
  constructor(private modalCtrl: ModalController) { }
  displayFomat = `HH ${'Giờ'}: mm ${'PᏂút'}  : ss ${'Giây'}`
  @Input() name: string;
  customPopoverOptions: any = {
    cssClass: 'my-custom-popover',
  };
  ngOnInit() {
    for(let i=1;i<20;i++){
      this.numberSelect.push(i);
    }
  }
  dismiss(data) {
    
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }
  numberSelectLoopDevice(i: number){
    return new Array(i);
  }
}
