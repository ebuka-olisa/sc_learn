import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { InvestorViewModel } from 'src/app/models/investor';
import { Ng2TelInput } from 'ng2-tel-input';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';
import { VisitorService } from '../../visitor.service';
import { MyValidationErrors } from 'src/app/models/my-validation-error';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { Subscription, timer } from 'rxjs';

@Component({
    selector: 'app-visitor-invest',
    templateUrl: './visitor-invest.component.html',
    styleUrls: ['./visitor-invest.component.scss']
})
export class VisitorInvestComponent implements OnInit, OnDestroy {

    @ViewChild(Ng2TelInput, {static: false}) telInputDirectiveRef!: Ng2TelInput;

    @ViewChild('myModal') myModal: any;
    private modalRef !: NgbModalRef;

    Investor!: InvestorViewModel;
    TempPhone!: string;
    InvesterEmailAddress!: string;
    fieldErrors: any = {};
    processing = false;

    showCountDown = false;
    subscription!: Subscription;
    SecondsPast!: string;
    MinutesPast!: string;
    HoursPast!: string;
    DaysPast!: string;

    modalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true
    };

    constructor(private modalService: NgbModal,
                private titleService: Title,
                private visitorService: VisitorService,
                private validationErrorService: ValidationErrorService) {
        // set page title
        this.titleService.setTitle('Investment | Accave');

        this.Investor = new InvestorViewModel();
        this.Investor.investmentRange = '';
     }

    ngOnInit(): void {
        let now = new Date();
        now.setHours(now.getHours() + (now.getTimezoneOffset() / 60)  + 1);

        const stopDate = new Date('2022-04-15T20:14:00');

        if (stopDate > now) {
            this.showCountDown = true;

            // past
            const source = timer(1000, 1000);
            this.subscription = source.subscribe(val => {
                now = new Date();
                now.setHours(now.getHours() + (now.getTimezoneOffset() / 60)  + 1);

                const timeDiff = stopDate.getTime() - now.getTime();
                const days = Math.floor(timeDiff / (1000 * 3600 * 24));
                this.DaysPast = days >= 10 ? days + '' : '0' + days;
                const hours = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
                this.HoursPast = hours >= 10 ? hours + '' : '0' + hours;
                const minutes = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60));
                this.MinutesPast = minutes >= 10 ? minutes + '' : '0' + minutes;
                const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
                this.SecondsPast = seconds >= 10 ? seconds + '' : '0' + seconds;

                if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
                    this.showCountDown = false;
                    this.subscription.unsubscribe();
                }
            });

        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.modalRef) {
            this.modalRef.close();
        }
    }



    // Phone operations
    checkPhoneError(): void {
        if (this.TempPhone !== '') {
            if (this.telInputDirectiveRef.isInputValid()) {
                this.fieldErrors.PhoneNumber = null;
            } else {
                this.fieldErrors.PhoneNumber = 'Enter a valid phone number';
            }
        } else {
            this.fieldErrors.PhoneNumber = null;
        }
    }

    getNumber(obj: string): void {
        this.Investor.phoneNumber = obj;
        if (this.telInputDirectiveRef.isInputValid()) {
            this.fieldErrors.Phone = null;
        }
    }


    // Investment Range
    updateInvestmentRange(): void{
        // get selected range
        if (this.Investor.investmentRange !== '' || this.Investor.investmentRange.indexOf('-') !== -1){
            this.Investor.lowerRange = parseInt(this.Investor.investmentRange.split('-')[0].trim(), 10);
            this.Investor.upperRange = parseInt(this.Investor.investmentRange.split('-')[1].trim(), 10);
        } else {
            this.Investor.lowerRange = 0;
            this.Investor.upperRange = 0;
        }
    }


    // Register
    save(): void{
        this.processing = true;
        this.fieldErrors = {};

        // check form
        let formError = false;
        if (!this.Investor.firstName || this.Investor.firstName.trim() === '') {
            formError = true;
            this.fieldErrors.FirstName = 'Please enter your first name';
        }
        if (!this.Investor.lastName || this.Investor.lastName.trim() === '') {
            formError = true;
            this.fieldErrors.LastName = 'Please enter your last name';
        }
        if (!this.Investor.email || this.Investor.email.trim() === '') {
            formError = true;
            this.fieldErrors.Email = 'Please enter your email address';
        }
        if (!this.telInputDirectiveRef.isInputValid()) {
            formError = true;
            this.fieldErrors.PhoneNumber = 'Please enter a valid phone number';
        }
        if (!this.Investor.investmentRange || this.Investor.investmentRange.trim() === ''
        || this.Investor.lowerRange === 0 || this.Investor.upperRange === 0) {
            formError = true;
            this.fieldErrors.InvestmentRange = 'Please select the range of your investment';
        }

        // submit form
        if (!formError) {
            this.visitorService.registerInvestor(this.Investor)
            .subscribe(

                // success
                (response) => {
                    // clear form
                    this.processing = false;
                    this.InvesterEmailAddress = this.Investor.email;
                    this.Investor = new InvestorViewModel();
                    this.TempPhone = '';

                    // show success message
                    this.modalRef = this.modalService.open(this.myModal, this.modalConfig);
                },

                // error
                error => {
                    const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                    this.fieldErrors = allErrors.fieldErrors;
                    if (this.fieldErrors.error && this.fieldErrors.error.indexOf('email') !== 1) {
                        this.fieldErrors.Email = this.fieldErrors.error;
                    }
                    this.processing = false;
                }
            );
        } else {
            this.processing = false;
        }
    }

    closeModal(): void{
        // this.modalService.close(this.modalRef);
        this.modalRef.close();
    }
}
