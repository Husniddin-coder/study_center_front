import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[NoSymbolInput]'
})
export class NoSymbolInputDirective {

  private regex: RegExp = new RegExp(/^[a-zA-Z0-9]*$/);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];

  constructor() { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = (event.target as HTMLInputElement).value;
    let next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
}
