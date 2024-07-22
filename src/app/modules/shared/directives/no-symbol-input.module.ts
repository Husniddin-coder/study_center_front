import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NoSymbolInputDirective } from './no-symbol-input.directive';


@NgModule({
    imports: [CommonModule],
    exports: [NoSymbolInputDirective],
    declarations: [NoSymbolInputDirective],
    providers: [],
})
export class NoSymbolInputModule { }
