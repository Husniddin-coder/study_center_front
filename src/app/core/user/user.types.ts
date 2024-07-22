export interface User {
    id: number;
    name: string;
    userName: string;
    email: string;
    avatar?: string;
    status?: status;
    phoneNumber: string,
}

export enum status {
    Online = 10,
    Away = 11,
    Busy = 12,
    Invisible = 13
}

export interface UserUpdateDto {
    name: string;
    userName: string;
    email: string;
    oldAvatar?: string;
    status?: status;
    phoneNumber: string,
    newAvatar?: File
}