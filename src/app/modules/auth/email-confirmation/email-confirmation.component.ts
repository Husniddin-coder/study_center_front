import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, Router, RouterLink, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject, catchError, finalize, pipe, takeUntil, takeWhile, tap, timer } from 'rxjs';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { MessageService } from 'primeng/api';
import { _MatSelectBase } from '@angular/material/select';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'email-confirmation',
  standalone: true,
  imports: [CommonModule, TranslocoModule, RouterModule, FuseAlertComponent, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, RouterLink],
  templateUrl: './email-confirmation.component.html',
  providers: [MessageService]
})
export class EmailConfirmationComponent implements OnInit, OnDestroy {

  emailConfirmation: FormGroup;
  countdown: number = 120;
  isDisabledForResend: boolean = true;
  errorMessage: string;
  isConfirmed: boolean = false;
  showAlert: boolean = false
  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };
  countdownMapping: any = {
    '=1': '# second',
    'other': '# seconds',
  };

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  constructor(
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    private _router: Router,
    private _messageService: MessageService) { }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  ngOnInit(): void {
    this.emailConfirmation = this._formBuilder.group({
      code: ['', [Validators.required]],
    });

    timer(1000, 1000)
      .pipe(
        finalize(() => {
          this.isDisabledForResend = true;
        }),
        takeWhile(() => this.countdown > 0),
        takeUntil(this._unsubscribeAll),
        tap(() => this.countdown--),
      )
      .subscribe();
  }


  verifyCode() {
    const formData = JSON.parse(localStorage.getItem('signUp'));
    this._authService.verifyEamil(formData.email, this.emailConfirmation.get('code').value)
      .pipe(
        catchError(error => {
          // Handle the error here
          console.error('Error occurred:', error);
          // You can show an error message to the user
          return error;// Re-throw the error if needed
        })
      )
      .subscribe((result) => {
        if (result) {
          this.isConfirmed = true;
          this._authService.signUp({ userName: formData.userName, email: formData.email, password: formData.password, company: formData.company })
            .subscribe((result) => {
              if (result) {
                this.alert = {
                  type: 'success',
                  message: 'Email verified successfully! Sign up completed, please sign in.',
                };
                this.showAlert = true;

                localStorage.removeItem('signUp')
                setTimeout(() => {
                  this._router.navigate(['/sign-in'])
                }, 5000);
              }
            })
        }
        else {
          this.alert = {
            type: 'error',
            message: 'Email does not found! Are you sure this email is yours?',
          };
          this.showAlert = true;
          setTimeout(() => {
            this._router.navigate(['/email-confirmation'])
          }, 2000);
        }
      })
  }

  //resend code
  resendCode() {
    this._authService.resendCode(JSON.parse(localStorage.getItem('signUp')).email)
      .subscribe((result) => {
        if (result) {
          this._router.navigate(['/email-confirmation'])
        }
      })
  }

  goToSignIn() {
    localStorage.removeItem('signUp')
    this._router.navigate(['/sign-in'])
  }
}
