import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-limit-ph-modal',
  templateUrl: './limit-ph-modal.component.html',
  styleUrls: ['./limit-ph-modal.component.scss'],
})
export class LimitPhModalComponent implements OnInit {

  constructor(
    public modalController: ModalController
  ) { }

  knobValues = {
    upper: 14,
    lower: 0
  };

  ionSliderForValues(event: any){
    // console.log(this.knobValues);
  }

  // selectedValue;
  // changeFunction($event) {
  //   this.selectedValue = $event.detail.value;
  // }
  ngOnInit() { }

  dismissModal() {
    this.modalController.dismiss({});
  }

  onSubmit() {
    this.modalController.dismiss({
      data: this.knobValues
    });
  }

}
