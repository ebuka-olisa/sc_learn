import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { EditUser, MyUser, TokenUser } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    private jwtHelper: JwtHelperService;
    // private currentUser !: MyUser | null;

    // userInfoUpdate: EventEmitter<any> = new EventEmitter();

    constructor() { this.jwtHelper = new JwtHelperService(); }

    // Token
    setToken(tokenString: string): void {
        localStorage.setItem('user', tokenString);
    }

    getToken(): string {
        return this.getUserAndToken() ? this.getUserAndToken().token : '';
    }


    // User
    getUser(): MyUser | null {
        // if (!this.currentUser) {
        const userAndToken = this.getUserAndToken();
        if (userAndToken) {
            // this.currentUser = new MyUser(userAndToken);
            return new MyUser(userAndToken);
        }
        return null;
        // }
        // return this.currentUser;
    }

    editUser(user: EditUser): void {
        const userAndToken = this.getUserAndToken();
        userAndToken.user.lastName = user.lastName;
        userAndToken.user.firstName = user.firstName;
        // userAndToken.user.gender = user.gender;
        userAndToken.user.email = user.email;
        this.setToken(JSON.stringify(userAndToken));
    }

    /*clearCurrentUser(): void {
        this.currentUser = null;
    }*/

    private getUserAndToken(): TokenUser {
        return JSON.parse(localStorage.getItem('user') || '{}') as TokenUser;
    }

    isAdminloggedIn(): boolean {
        const token = this.getUserAndToken() ? (this.getUserAndToken().token ? this.getUserAndToken().token : null) : null;
        if (token) {
            if (!this.jwtHelper.isTokenExpired(token)) {
                const decodedToken = this.jwtHelper.decodeToken(token);
                if (decodedToken.user_type === 'Admin') { return true; }
                return false;
            }
        }

        return false;
    }

    /*isUserloggedIn(): boolean {
        const token = this.getUserAndToken() ? (this.getUserAndToken().token ? this.getUserAndToken().token : null) : null;
        if (token) {
            return true;
        }
        return false;
    }*/

    logout(): void {
        // remove user from local storage to log user out
        localStorage.removeItem('user');
        // this.clearCurrentUser();
    }

}
