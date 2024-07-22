import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthGuard } from './core/auth/guards/auth.guard';
import { PermissionCheckDirective } from './core/auth/directives/permission.directive';
import { PermissionCheckModule } from './core/auth/directives/permission.module';
import { NoSymbolInputModule } from './modules/shared/directives/no-symbol-input.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    providers: [MessageService],
    imports: [RouterOutlet, PermissionCheckModule, NoSymbolInputModule, TranslocoModule],
})
export class AppComponent {
    /**
     * Constructor
     */
    constructor() {
    }
}
