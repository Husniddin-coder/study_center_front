import { status } from "app/core/user/user.types";
import { Id } from "app/modules/models/id.interface";

export interface UserRequest {
    name: string,
    userName: string,
    email: string,
    phoneNumber: string,
    status?: status,
    avatar?: string,
}

export interface UserResponse extends UserRequest, Id {
}
