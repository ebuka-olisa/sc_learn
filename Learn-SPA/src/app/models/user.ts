import { JwtHelperService } from '@auth0/angular-jwt';

export class LoginUser {

    constructor() {
        this.username = '';
        this.password = '';
    }

    username: string;
    password: string;
}


export class MyUser {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    fullName: string;
    photoUrl: string;
    // loginType: string;

    constructor(userAndToken: TokenUser) {
        const decodedToken = new JwtHelperService().decodeToken(userAndToken.token);
        this.id = decodedToken.nameid;
        // this.email = decodedToken.unique_name;
        this.role = decodedToken.role;
        // this.loginType = decodedToken.loginType;
        this.firstName = userAndToken.user.firstName;
        this.lastName = userAndToken.user.lastName;
        this.fullName = userAndToken.user.firstName + ' ' + userAndToken.user.lastName;
        this.email = userAndToken.user.email;
        this.photoUrl = userAndToken.user.photoUrl;
    }
}

export class TokenUser {
    token !: string;
    user !: { lastName: string; firstName: string; phoneNumber: string; email: string; photoUrl: string; };
}

export class EditUser {
    id!: number;
    firstName!: string;
    lastName!: string;
    // gender!: string;
    email!: string;
    phoneNumber!: string;
}