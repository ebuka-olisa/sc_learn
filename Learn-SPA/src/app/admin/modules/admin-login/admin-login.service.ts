import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginUser } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class AdminLoginService {

    // private staffAuthBase = environment.Url + 'qm_475/staff/auth';
    private adminAuthBase = environment.Url + 'api/auth';

    constructor(private http: HttpClient,
                private authService: AuthService) {}

    signIn(user: LoginUser): Observable<LoginUser> {
        return this.http.post<LoginUser>(this.adminAuthBase + '/login', user)
        .pipe(
            tap((response: any) => {
                if (response) {
                this.authService.setToken(JSON.stringify(response));
                }
            })
        );
    }

}
