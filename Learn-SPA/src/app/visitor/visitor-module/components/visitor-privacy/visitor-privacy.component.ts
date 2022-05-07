import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-visitor-privacy',
    templateUrl: './visitor-privacy.component.html',
    styleUrls: ['./visitor-privacy.component.scss']
})
export class VisitorPrivacyComponent implements OnInit {

    constructor(titleService: Title) {
        titleService.setTitle('Privacy Policy | Accave');
    }

    ngOnInit(): void {
    }

}
