import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[minValue]'
})
export class MinValueDirective {

  @Input() minValue: number = 0;

  constructor(
    private elementRef: ElementRef,
    private control: NgControl
  ) { }

  @HostListener('ionBlur', ['$event']) ionInput() {
    const abstractControl = this.control.control;
    const inputElement = this.elementRef.nativeElement.getElementsByTagName('input')[0];

    if (!inputElement) { return; }
    const value = Number(inputElement.value);

    if (value >= this.minValue) { return; }
    inputElement.value = this.minValue;

    if (!abstractControl) { return; }
    abstractControl.patchValue(this.minValue);
  }
}