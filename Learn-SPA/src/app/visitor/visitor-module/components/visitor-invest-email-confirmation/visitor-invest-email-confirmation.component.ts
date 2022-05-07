import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { VisitorService } from '../../visitor.service';

@Component({
    selector: 'app-visitor-invest-email-confirmation',
    templateUrl: './visitor-invest-email-confirmation.component.html',
    styleUrls: ['./visitor-invest-email-confirmation.component.scss']
})
export class VisitorInvestEmailConfirmationComponent implements OnInit {

    EmailConfirmation = {
        Email: '',
        Token: ''
    };
    processing = true;
    confirmed = false;

    constructor(titleService: Title,
                private route: ActivatedRoute,
                private visitorService: VisitorService) {
        titleService.setTitle('Email confirmation | Accave');
    }

    ngOnInit(): void {
        this.route.queryParams
        .subscribe(params => {
            this.EmailConfirmation.Email = params.email;
            this.EmailConfirmation.Token = params.token;

            // verify email
            this.visitorService.confirmEmail(this.EmailConfirmation.Email, this.EmailConfirmation.Token)
            .subscribe(

                // success
                (response) => {
                    this.processing = false;
                    this.confirmed = true;
                },

                // error
                error => {
                    this.processing = false;
                    this.confirmed = false;
                }
            );
        }
    );
    }

}
