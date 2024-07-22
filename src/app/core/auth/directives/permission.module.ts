import { NgModule } from '@angular/core';
import { PermissionCheckDirective } from './permission.directive';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';


@NgModule({
    imports: [CommonModule],
    exports: [PermissionCheckDirective],
    declarations: [PermissionCheckDirective],
    providers: [AuthService],
})
export class PermissionCheckModule { }
