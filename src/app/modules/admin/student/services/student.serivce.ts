import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, map, of, shareReplay, switchMap, take, tap, throwError } from 'rxjs';
import { StudentPagination, StudentResponse } from '../models/student.model';
import { BaseService } from '../../shared/services/base.service';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class StudentService {

    constructor(private base$: BaseService) { }

    private baseUrl: string = environment.BASE_URL

    private _pagination: BehaviorSubject<StudentPagination | null> =
        new BehaviorSubject(null);
    private _students: BehaviorSubject<StudentResponse[] | null> =
        new BehaviorSubject(null);
    private _student: BehaviorSubject<StudentResponse | null> =
        new BehaviorSubject(null);


    get students$(): Observable<StudentResponse[]> {
        return this._students.asObservable();
    }

    get student$(): Observable<StudentResponse> {
        return this._student.asObservable();
    }

    get pagination$(): Observable<StudentPagination> {
        return this._pagination.asObservable();
    }

    getStudents(
        url: string = "Students",
        page: number = 0,
        size: number = 10,
        sort: string = 'firstname',
        order: 'asc' | 'desc' | '' = 'asc',
        search: string = ''
    ): Observable<{
        pagination: StudentPagination, result: StudentResponse[]
    }> {
        return this.base$.get<{ pagination: StudentPagination, result: StudentResponse[] }>(url, page, size, sort, order, search)
            .pipe(
                tap((response) => {
                    if (response.result && response.result.length > 0) {
                        response.result.forEach(student => {
                            if (student.images && student.images.length > 0) {
                                student.images = student.images.map(image => this.baseUrl + image);
                            }
                        });
                    }
                    this._pagination.next(response.pagination);
                    this._students.next(response.result);
                }), shareReplay(1)
            );
    }

    getStudentById(id: number): Observable<StudentResponse> {
        return this._students.pipe(
            take(1),
            map((students) => {
                // Find the student
                const student = students.find((item) => item.id === id) || null;
                // Update the student
                this._student.next(student);
                // Return the student
                return student;
            }),
            switchMap((student) => {
                if (!student) {
                    return throwError(
                        'Could not found student with id of ' + id + '!'
                    );
                }
                return of(student);
            }),
            // shareReplay(1)
        );
    }

    createStudent(url: string, model: any): Observable<StudentResponse> {
        return this.students$.pipe(
            take(1),
            switchMap((students) =>
                this.base$.post<StudentResponse>(url, model).pipe(
                    map((newStudent) => {
                        this._students.next([newStudent, ...students]);
                        return newStudent;
                    })  
                )
            )
        );
    }

    updateStudent(
        id: number,
        student: any
    ): Observable<StudentResponse> {
        return this.students$.pipe(
            take(1),
            switchMap((students) =>
                this.base$
                    .put<StudentResponse>("Students", id, student)
                    .pipe(
                        map((updatedStudent) => {
                            // Find the index of the updated student
                            const index = students.findIndex(
                                (item) => item.id === id
                            );
                            // Update the student
                            students[index] = updatedStudent;
                            // Update the students
                            this._students.next(students);
                            return updatedStudent;
                        }),
                        switchMap((updatedStudent) =>
                            this.student$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the student if it's selected
                                    this._student.next(updatedStudent);
                                    // Return the updated student
                                    return updatedStudent;
                                })
                            )
                        )
                    )
            )
        );
    }

    deleteStudent(url: string, id: number): Observable<boolean> {
        return this.students$.pipe(
            take(1),
            switchMap((students) =>
                this.base$
                    .delete<any>(url, id)
                    .pipe(
                        map((isDeleted: boolean) => {
                            // Find the index of the deleted student
                            const index = students.findIndex(
                                (item) => item.id === id
                            );

                            // Delete the student
                            students.splice(index, 1);

                            // Update the stidents
                            this._students.next(students);

                            // Return the deleted status
                            return isDeleted;
                        })
                    )
            )
        );
    }
}