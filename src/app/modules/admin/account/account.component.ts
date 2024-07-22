import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AccountService } from './services/account.service';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { UserResponse } from './models/user.model';
import { status } from 'app/core/user/user.types';
import { MessageService } from 'primeng/api';
import { BaseService } from '../shared/services/base.service';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'account',
  standalone: true,
  imports: [CommonModule, TranslocoModule, ToastModule, FileUploadModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatInputModule, TextFieldModule, MatSelectModule, MatOptionModule, MatButtonModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  providers: [AccountService, MessageService]
})
export class AccountComponent implements OnInit {

  accountForm: FormGroup;
  selectedFile: File = null;

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _accountService: AccountService,
    private messageService: MessageService,
    private base$: BaseService
  ) {
  }

  ngOnInit(): void {
    this.accountForm = this._formBuilder.group({
      name: [''],
      userName: [''],
      email: ['', Validators.email],
      phoneNumber: [''],
      status: status,
      avatar: [''],
    });

    this.setValuesToForm(this._accountService.getUser());
  }

  private setValuesToForm(user: UserResponse) {
    type FormGroupKeys = keyof typeof this.accountForm.controls;
    Object.keys(this.accountForm.controls).forEach((key) => {
      this.accountForm.controls[key as FormGroupKeys].setValue(
        user[key as FormGroupKeys]
      );
    });
  }


  uploadAvatar(fileList: FileList): void {
    // Return if canceled
    if (!fileList.length) {
      return;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.selectedFile = file
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Update the form control value with the base64 encoded image
        this.accountForm.get('avatar')?.setValue(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeAvatar(): void {
    this.accountForm.get('avatar')?.setValue('');

  }

  UpdateUserProfile() {
    const student = this.accountForm.getRawValue();
    let accountFromData = new FormData();
    if (this.accountForm.valid) {
      accountFromData.append('name', this.accountForm.get('name').value)
      accountFromData.append('userName', this.accountForm.get('userName').value)
      accountFromData.append('email', this.accountForm.get('email').value)
      accountFromData.append('phoneNumber', this.accountForm.get('phoneNumber').value)
      accountFromData.append('status', this.accountForm.get('status').value)
      accountFromData.append('oldAvatar', this.base$.extractFilenameFromUrl(student.avatar))

      if (this.selectedFile) {
        accountFromData.append('newAvatar', this.selectedFile, this.selectedFile.name);
      }

      const newUser = this._accountService.updateUser(accountFromData);
      this.selectedFile = null;
    }
    setTimeout(() => {
      window.location.reload();
    }, 1000);

    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'User updated successfully', life: 2000 });
  }
}
