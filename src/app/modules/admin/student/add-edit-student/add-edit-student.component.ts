import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { StudentResponse } from '../models/student.model';
import { BaseService } from '../../shared/services/base.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { StudentService } from '../services/student.serivce';
import { SharedModule } from '../../shared/module/shared.module';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { Language } from 'app/modules/models/language.enum';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { NgIf } from '@angular/common';


@Component({
  selector: 'add-edit-student',
  standalone: true,
  imports: [SharedModule, MatSelectModule, MatOptionModule, MatCheckboxModule, MatRadioModule],
  templateUrl: './add-edit-student.component.html',
  styleUrls: ['./add-edit-student.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService, MessageService]
})
export class AddEditStudentComponent implements OnInit {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    protected $base: BaseService,
    private studentService: StudentService,
    private messageService: MessageService,
    private _formBuilder: UntypedFormBuilder,
    private translocoService: TranslocoService,
    private _changeDetectorRef: ChangeDetectorRef,
    private confirmationService: ConfirmationService) {

  }

  @Input() visible = false;
  @Input() isAdded: boolean = false;
  @Input() studentId: number | null = null;
  @Output() isAddedChange = new EventEmitter<boolean>();
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() parentFunction: EventEmitter<void> = new EventEmitter();



  //Declarations
  selectedFile: File = null;
  isLoading: boolean = false;
  students$: StudentResponse[]
  selectedStudentForm: FormGroup;
  formFieldHelpers: string[] = [''];
  flashMessage: 'success' | 'error' | null = null;
  currentTheme: string = localStorage.getItem('scheme')
  public selectedStudent: StudentResponse | null = null;
  languages = ['Uzbek', 'English', 'Russia'];
  isStpend = false;

  ngOnInit(): void {
    this.selectedStudentForm = this._formBuilder.group({
      id: [''],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      enrollmentDate: ['', [Validators.required]],
      major: ['', [Validators.required]],
      password: ['', [Validators.required]],
      language: [Language],
      stipend: [false],
      images: [''],
      currentImageIndex: [0],
      active: [false],

    });
  }

  onFileSelected(event: any) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.selectedFile = fileList[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.selectedStudentForm.get('images')?.setValue([reader.result]);
        this._changeDetectorRef.detectChanges()
      };

      reader.readAsDataURL(this.selectedFile);
    }
  }

  selectLanguage(lang: string) {
    this.selectedStudentForm.get('language').setValue(lang)
    console.log(this.selectedStudentForm.get('language'));

  }

  onCheckboxChange(event: any): void {
    const checked = event.checked;
    if (checked) {
      this.selectedStudentForm.get('stipend').setValue(true);
    } else {
      this.selectedStudentForm.get('stipend').setValue(false);
    }
  }

  GetStudentById(studentId: number, students: StudentResponse[]): void {
    this.currentTheme = localStorage.getItem('scheme') || '';
    this.studentId = studentId;
    this.studentService.getStudentById(studentId).subscribe((student) => {
      this.selectedStudent = student;
      this.students$ = students;
      this.selectedStudentForm.patchValue(student);
      this._changeDetectorRef.markForCheck();
    });
  }

  openDialog() {
    this.currentTheme = localStorage.getItem('scheme') || '';
    this.selectedStudentForm.reset({
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      enrollmentDate: '',
      major: '',
      password: '',
      language: Language.Uzbek,
      stpend: false,
      images: [],
      currentImageIndex: 0,
      active: false,
    });
  }

  createOrUpdateStudent(): void {
    if (this.selectedStudentForm.invalid) {
      this.markFormGroupTouched(this.selectedStudentForm);
      return;
    }

    this.isLoading = true;

    if (this.isAdded) {
      this.createStudent();
    } else {
      this.updateStudent();
    }
  }

  private createStudent(): void {
    const formData = this.prepareFormData();
    this.studentService.createStudent('Students', formData).pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe(
      () => this.onSuccess('Success', 'Student added successfully'),
      () => this.onError('Failed to add student')
    );
  }

  private updateStudent(): void {
    const studentId = this.selectedStudentForm.get('id')?.value;
    const formData = this.prepareFormData();
    this.studentService.updateStudent(studentId, formData).pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe(
      () => this.onSuccess('Success', 'Student updated successfully'),
      () => this.onError('Failed to update student')
    );
  }

  private prepareFormData(): FormData {
    const formData = new FormData();
    const student = this.selectedStudentForm.getRawValue();

    Object.keys(student).forEach(key => {
      if (key !== 'images') {
        formData.append(key, student[key]);
      }
    });

    if (this.isAdded) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }
    else {

      if (student.images && student.images.length > 0) {
        const oldImage = this.students$.find(x => x.id == this.studentId)?.images[0];
        if (oldImage) {
          formData.append('oldImage', this.$base.extractFilenameFromUrl(oldImage));
        }
      }

      if (this.selectedFile) {
        formData.append('newImage', this.selectedFile, this.selectedFile.name);
      }
    }
    this.selectedFile = null;
    return formData;
  }

  private onSuccess(summary: string, detail: string): void {
    this.showFlashMessage('success');
    this.messageService.add({ severity: 'success', summary: summary, detail: detail, life: 2000 });
    this.isLoading = false;
    this.visible = false;
    this.parentFunction.emit();
    this._changeDetectorRef.markForCheck();
  }

  private onError(detail: string): void {
    console.error('Error:', detail);
    this.showFlashMessage('error');
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detail });
    this.isLoading = false;
    this._changeDetectorRef.markForCheck();
  }

  showFlashMessage(type: 'success' | 'error'): void {
    this.flashMessage = type;
    this._changeDetectorRef.markForCheck();

    setTimeout(() => {
      this.flashMessage = null;
      this._changeDetectorRef.markForCheck();
    }, 3000);
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      control.markAsDirty();
      control.updateValueAndValidity();
    });
  }

  confirm2(event: Event) {
    const message = this.translocoService.translate('Do you want to delete this student information?');
    const header = this.translocoService.translate('Delete Confirmation');
    const detail = this.translocoService.translate('You have rejected')
    const summary = this.translocoService.translate('Rejected')
    const Confirmed = this.translocoService.translate('Confirmed')
    const success = this.translocoService.translate('Student deleted successfully')
    const fail = this.translocoService.translate('Failed to delete student')

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: message,
      header: header,
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptIcon: "none",
      rejectIcon: "none",

      accept: () => {
        // Delay before actual deletion
        this.studentService.deleteStudent("Students", this.studentId).subscribe(
          () => this.onSuccess(Confirmed, success),
          () => this.onError(fail),
        );
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: summary, detail: detail });
      }
    });
  }

  closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
