import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-show-info',
    templateUrl: './show-info.component.html',
    styleUrls: ['./show-info.component.scss']
})
export class ShowInfoComponent implements OnInit {

    @Input() ModalContent: any;

    Title!: string;
    Message!: string;
    Icon!: string;
    Visitor = false;

    constructor(private activeModal: NgbActiveModal) { }

    ngOnInit(): void {
        if (this.ModalContent.title) {
            this.Title = this.ModalContent.title;
        }
        if (this.ModalContent.message) {
            this.Message = this.ModalContent.message;
        }
        if (this.ModalContent.icon) {
            this.Icon = this.ModalContent.icon;
        }
        if (this.ModalContent.source && this.ModalContent.source === 'Visitor') {
            this.Visitor = true;
        }
    }

    dismiss(): void {
        this.activeModal.dismiss();
    }

}
