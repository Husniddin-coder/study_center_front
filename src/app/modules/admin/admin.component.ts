import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StudentComponent } from './student/student.component';
import { AccountComponent } from './account/account.component';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
    selector: 'admin',
    standalone: true,
    templateUrl: './admin.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterOutlet, StudentComponent, AccountComponent, TranslocoModule],
})
export class AdminComponent {
    /**
     * Constructor
     */
    constructor() { }
}
