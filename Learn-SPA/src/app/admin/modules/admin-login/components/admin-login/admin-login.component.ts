import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MyValidationErrors } from 'src/app/models/my-validation-error';
import { LoginUser } from 'src/app/models/user';
import { NotificationService } from 'src/app/services/notification.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { AdminLoginService } from '../../admin-login.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {

    User: LoginUser;
    validationErrors: any[] = [];
    fieldErrors: any = {};
    returnUrl = '/scl-admin';
    processing = false;

    constructor(private loginService: AdminLoginService,
                private titleService: Title,
                private validationErrorService: ValidationErrorService,
                private router: Router,
                private route: ActivatedRoute,
                private notificationService: NotificationService) {
        this.titleService.setTitle('Admin Login | Accave');
        this.User = new LoginUser();
    }

    ngOnInit(): void {
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/scl-admin';
    }

    validEmail(email: string): boolean {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    hasAllValues(): boolean {
        return this.User.username !== undefined && this.User.password !== undefined
            && this.User.username.trim().length > 0 && this.User.password.trim().length > 0;
    }

    signin(): void {
        this.processing = true;
        this.validationErrors = [];
        this.fieldErrors = {};

        if (!this.validEmail(this.User.username)) {
            this.fieldErrors.Username = 'Enter a valid email address';
            this.processing = false;
        } else {
            this.loginService.signIn(this.User).subscribe(

                // success
                () => {
                    this.notificationService.clearAll();
                    this.router.navigate([this.returnUrl]);
                    this.processing = false;
                },

                // error
                (error: any) => {
                    const allErrors: MyValidationErrors = this.validationErrorService
                        .showValidationErrors(error);
                    this.validationErrors = allErrors.validationErrors;
                    this.fieldErrors = allErrors.fieldErrors;
                    if (this.fieldErrors.Username === undefined && this.fieldErrors.Password === undefined) {
                        this.validationErrors.push('The email and password combination does not match any account. Please try again.');
                    }
                    this.processing = false;
                }
            );
        }
    }
}
