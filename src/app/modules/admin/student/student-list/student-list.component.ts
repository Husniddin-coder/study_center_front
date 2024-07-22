import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AsyncPipe, CommonModule, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { BaseService } from '../../shared/services/base.service';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { FuseConfigService } from '@fuse/services/config';
import { StudentPagination, StudentResponse } from '../models/student.model';
import { Subject, debounceTime, map, switchMap, takeUntil } from 'rxjs';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AddEditStudentComponent } from '../add-edit-student/add-edit-student.component';
import { fuseAnimations } from '@fuse/animations';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { TranslocoModule } from '@ngneat/transloco';
import { PermissionCheckModule } from 'app/core/auth/directives/permission.module';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { StudentService } from '../services/student.serivce';
import { SharedModule } from '../../shared/module/shared.module';

@Component({
  selector: 'student-list',
  standalone: true,
  imports: [SharedModule, NgIf, MatProgressBarModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe, InputTextModule, MatDatepickerModule, FileUploadModule, ConfirmDialogModule, PermissionCheckModule, TranslocoModule, AddEditStudentComponent],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService, MessageService]
})
export class StudentListComponent implements OnInit, OnDestroy {

  constructor(
    protected $base: BaseService,
    private studentService: StudentService,
    private _formBuilder: UntypedFormBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
    private _fuseConfigService: FuseConfigService,

  ) { }

  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(AddEditStudentComponent) add_edit: AddEditStudentComponent

  scheme: string;
  theme: string;
  isAdded: boolean;
  studentId: number
  selectedFile: File = null;
  isLoading: boolean = false;
  students$: StudentResponse[]
  pagination: StudentPagination;
  formFieldHelpers: string[] = [''];
  selectedStudentForm: UntypedFormGroup;
  selectedStudent: StudentResponse | null = null;
  flashMessage: 'success' | 'error' | null = null;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  searchInputControl: UntypedFormControl = new UntypedFormControl();

  ngOnInit(): void {
    this.studentService.getStudents('Students', 0, 10, 'firstname').subscribe((result) => {
      this.students$ = result.result
      this.pagination = result.pagination
    });

    this.selectedStudentForm = this._formBuilder.group({
      id: [''],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      enrollmentDate: ['', [Validators.required]],
      major: ['', [Validators.required]],
      gpa: [''],
      images: [''],
      currentImageIndex: [0],
      active: [false],
    });

    this._fuseConfigService.config$.subscribe((w) => {
      this.scheme = w.scheme;
      this.theme = w.theme
    })
    // pagination ni olish
    this.getPagination();

    //search qilish
    this.Search();
  }

  private getPagination() {
    this.studentService.pagination$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((pagination: StudentPagination) => {

        this.pagination = pagination;
        this._changeDetectorRef.markForCheck();
      });
  }

  private Search() {
    this.searchInputControl.valueChanges
      .pipe(
        takeUntil(this._unsubscribeAll),
        debounceTime(300),
        switchMap((query) => {
          this.closeDetails();
          this.isLoading = true;
          return this.studentService.getStudents('Students', 0, 10, 'lastname', 'asc', query.toLowerCase());
        }),
        map((result) => {
          this.students$ = result.result;
          this.isLoading = false;
        })
      )
      .subscribe();
  }

  handlePageEvent(event: PageEvent) {
    this.studentService.getStudents("Students", event.pageIndex, event.pageSize, 'firstname', 'asc', '')
      .subscribe((result) => {
        this.students$ = result.result
      })
  }

  onSortChange(event: any) {
    this.studentService.getStudents("Students", this._paginator.pageIndex, this._paginator.pageSize, event.active.toLowerCase(), event.direction.toLowerCase(), '')
      .subscribe((resultl) => {
        this.students$ = resultl.result
      })
  }

  GetAllStudents() {
    this.studentService.getStudents('Students', 0, 10, 'firstname', 'asc').subscribe((result) => {
      this.students$ = result.result
    });
  }

  UpdateStudent(studentId: number): void {
    this.isAdded = false;
    this.visible = true;
    this.add_edit.GetStudentById(studentId, this.students$)
  }

  closeDetails() {
    this.selectedStudent = null;
  }

  showFlashMessage(type: 'success' | 'error'): void {
    this.flashMessage = type;
    this._changeDetectorRef.markForCheck();

    setTimeout(() => {
      this.flashMessage = null;
      this._changeDetectorRef.markForCheck();
    }, 3000);
  }

  /**
   * Add Modal
   */
  visible: boolean = false;
  isDeleted: boolean = false;

  showDialog() {
    this.isAdded = true;
    this.visible = true;
    this.add_edit.students$ = this.students$
    this.add_edit.openDialog()
  }

  handleDialogClose(): void {
    this.visible = false;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
