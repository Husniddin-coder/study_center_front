import { Gender } from "app/modules/models/gender.enum";
import { Id } from "app/modules/models/id.interface";
import { Language } from "app/modules/models/language.enum";

export interface StudentResponse extends Id, StudentRequest { }

export interface StudentRequest {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth: Date;
    enrollmentDate: Date;
    major: string;
    gpa?: number;
    gender: Gender;
    stipend: boolean;
    language: Language;
    images?: string[];
}

export interface StudentPagination {
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}