import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-action',
  templateUrl: './confirm-action.component.html',
  styleUrls: ['./confirm-action.component.scss']
})
export class ConfirmActionComponent implements OnInit {

    @Output() completeAction = new EventEmitter<any>();
    @Input() ModalContent: any;

    Heading!: string;
    Body!: string;
    ExtraMessage!: string;
    Action!: string;
    ButtonColor!: string;
    Visitor = false;
    processing = false;

    constructor(private activeModal: NgbActiveModal) { }

    ngOnInit(): void {
        if (this.ModalContent.heading) {
            this.Heading = this.ModalContent.heading;
        }

        if (this.ModalContent.body) {
            this.Body = this.ModalContent.body;
        }

        if (this.ModalContent.extraMessage) {
            this.ExtraMessage = this.ModalContent.extraMessage;
        }

        if (this.ModalContent.action) {
            this.Action = this.ModalContent.action;
        }

        if (this.ModalContent.buttonColor) {
            this.ButtonColor = this.ModalContent.buttonColor;
        } else{
            this.ButtonColor = 'violet';
        }

        if (this.ModalContent.source && this.ModalContent.source === 'Visitor') {
            this.Visitor = true;
        }
    }

    act(): void {
        this.processing = true;
        this.completeAction.emit();
    }

    dismiss(): void {
        this.activeModal.dismiss();
    }

}
