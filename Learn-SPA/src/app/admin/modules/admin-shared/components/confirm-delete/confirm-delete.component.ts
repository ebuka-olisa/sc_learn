import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-confirm-delete',
    templateUrl: './confirm-delete.component.html',
    styleUrls: ['./confirm-delete.component.scss']
})
export class ConfirmDeleteComponent implements OnInit {

    @Output() completeDelete = new EventEmitter<any>();
    @Input() ModalContent: any;

    Item!: string;
    Body!: string;
    ExtraMessage!: string;
    Action!: string;
    Visitor = false;
    processing = false;

    constructor(private activeModal: NgbActiveModal) { }

    ngOnInit(): void {
        if (this.ModalContent.item) {
            this.Item = this.ModalContent.item;
        }

        if (this.ModalContent.body) {
            this.Body = this.ModalContent.body;
        }

        if (this.ModalContent.extraMessage) {
            this.ExtraMessage = this.ModalContent.extraMessage;
        }

        if (this.ModalContent.action) {
            this.Action = this.ModalContent.action;
        } else {
            this.Action = 'Delete';
        }

        if (this.ModalContent.source && this.ModalContent.source === 'Visitor') {
            this.Visitor = true;
        }
    }

    delete(): void {
        this.processing = true;
        this.completeDelete.emit();
    }

    dismiss(): void {
        this.activeModal.dismiss();
    }

}
