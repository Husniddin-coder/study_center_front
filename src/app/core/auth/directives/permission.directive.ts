import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../auth.service';

@Directive({
    selector: '[permissionCheck]'
})
export class PermissionCheckDirective {

    @Input() set permissionCheck(permissions: number[]) {
        this.permissions = permissions;
        this.updateView();
    }

    private permissions: number[];

    constructor(
        private authService: AuthService,
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
    ) { }

    private updateView(): void {
        const hasPermission = this.permissions && this.authService.checkPermission(this.permissions);
        if (hasPermission) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        }
        else {
            this.viewContainer.clear();
        }
    }
}