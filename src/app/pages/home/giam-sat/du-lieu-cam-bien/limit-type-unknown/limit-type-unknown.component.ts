import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-limit-type-unknown',
  templateUrl: './limit-type-unknown.component.html',
  styleUrls: ['./limit-type-unknown.component.scss'],
})
export class LimitTypeUnknownComponent implements OnInit {
  @Input() minReset: number;
  @Input() maxReset: number;
  @Input() lower: number;
  @Input() upper: number;

  icon = 'assets/icon-darkmode/11_Sensor_xanh_la.png';
  maxUnknow: number;

  knobValues = {
    upper: 100,
    lower: 0
  };

  constructor(
    public modalController: ModalController
  ) { }

  ngOnInit() {
    this.knobValues = {
      upper: this.upper,
      lower: this.lower
    };
    if (this.upper > 100) {
      this.maxUnknow = 100000;
    } else {
      this.maxUnknow = 100;
    }
  }
  ionSliderForValues(event: any){
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
    this.knobValues = {
      upper: this.maxReset,
      lower: this.minReset
    };
    this.modalController.dismiss({
      data: this.knobValues,
      changeSlider: false
    });
  }
}
