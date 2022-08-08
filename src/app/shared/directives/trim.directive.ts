import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[trimWhiteSpace]'
})
export class TrimDirective {
  constructor(
    private elementRef: ElementRef,
    private control: NgControl
  ) { }

  @HostListener('ionBlur', ['$event']) ionInput() {
    const abstractControl = this.control.control;
    const inputElement = this.elementRef.nativeElement.getElementsByTagName('input')[0];

    if (!inputElement) { return; }
    const value = inputElement.value?.trim();
    inputElement.value = value;

    if (!abstractControl) { return; }
    abstractControl.patchValue(value);
  }
}