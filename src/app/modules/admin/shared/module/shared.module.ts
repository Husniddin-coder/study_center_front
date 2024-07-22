import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@ngneat/transloco';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';

@NgModule({
    imports: [CommonModule, MatButtonModule, ToastModule, MatDatepickerModule, DialogModule, ReactiveFormsModule, TranslocoModule, ConfirmDialogModule, MatInputModule, MatFormFieldModule, ButtonModule, MatIconModule, FileUploadModule],
    exports: [CommonModule, MatButtonModule, ToastModule, MatDatepickerModule, DialogModule, ReactiveFormsModule, TranslocoModule, ConfirmDialogModule, MatInputModule, MatFormFieldModule, ButtonModule, MatIconModule, FileUploadModule],
    declarations: [],
    providers: [],
})
export class SharedModule { }