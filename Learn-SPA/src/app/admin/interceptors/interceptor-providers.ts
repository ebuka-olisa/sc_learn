import { UserTokenInterceptor } from './user-token.interceptor';
import { ErrorInterceptor } from './error.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

export const InterceptorProviders =
[
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    { provide: HTTP_INTERCEPTORS, useClass: UserTokenInterceptor, multi: true}
];
