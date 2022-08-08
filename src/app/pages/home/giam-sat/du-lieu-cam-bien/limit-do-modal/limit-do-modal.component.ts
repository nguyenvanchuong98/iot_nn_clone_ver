import {Component, Input, OnInit} from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-limit-do-modal',
  templateUrl: './limit-do-modal.component.html',
  styleUrls: ['./limit-do-modal.component.scss'],
})
export class LimitDoModalComponent implements OnInit {
  @Input() minReset: number;
  @Input() maxReset: number;
  @Input() lower: number;
  @Input() upper: number;
  icon =  'assets/icon-darkmode/3_Doam_xanh_la.png';

  constructor(
    public modalController: ModalController
  ) { }

  knobValues = {
    upper: 100,
    lower: 0
  };

  ionSliderForValues(event: any){
    // console.log(this.knobValues);
  }

  // selectedValue;
  // changeFunction($event) {
  //   this.selectedValue = $event.detail.value;
  // }
  ngOnInit() {
    if (this.lower === undefined || this.upper === undefined) {
      this.knobValues = {
        upper: 100,
        lower: 0
      }
    } else {
      this.knobValues = {
        upper: this.upper,
        lower: this.lower
      };
    }
  }

  dismissModal() {
    this.modalController.dismiss({});
  }

  onSubmit() {
    this.modalController.dismiss({
      data: this.knobValues,
      changeSlider: true
    });
  }
  reset(){
    // this.knobValues = {
    //   upper: this.maxReset,
    //   lower: this.minReset
    // };
    this.modalController.dismiss({
      data: 'reset',
      changeSlider: false
    });
  }
}
