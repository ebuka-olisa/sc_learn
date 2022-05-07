import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request).pipe(
            retry(1),
            catchError((err: any) => {
                let errorMessage = '';
                if (err instanceof HttpErrorResponse) {
                    if (err.status === 401) {
                        // redirect to the login route
                        this.authService.logout();
                        location.reload();
                    }
                    errorMessage = err.error.errors || err.error || err.message || err.statusText;
                }
                return throwError(errorMessage);
            })
        );
    }

}
