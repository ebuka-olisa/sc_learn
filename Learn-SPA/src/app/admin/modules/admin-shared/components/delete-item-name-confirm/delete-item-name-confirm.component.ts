import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-delete-item-name-confirm',
  templateUrl: './delete-item-name-confirm.component.html',
  styleUrls: ['./delete-item-name-confirm.component.scss']
})
export class DeleteItemNameConfirmComponent implements OnInit {

    @Output() completeDelete = new EventEmitter<any>();
    @Input() ModalContent: any;

    Item!: string;
    ExtraMessage!: string;
    Action!: string;
    Name!: string;
    CorrectName!: string;

    ParentName!: string;
    CorrectParentName!: string;
    HasParentName = false;

    fieldErrors: any = {};
    deleting!: boolean;

    constructor(private activeModal: NgbActiveModal) { }

    ngOnInit(): void {
        if (this.ModalContent.item) {
            this.Item = this.ModalContent.item;
        }

        if (this.ModalContent.extraMessage) {
            this.ExtraMessage = this.ModalContent.extraMessage;
        }

        if (this.ModalContent.correctName) {
            this.CorrectName = this.ModalContent.correctName;
        }

        if (this.ModalContent.correctParentName) {
            this.CorrectParentName = this.ModalContent.correctParentName;
            this.HasParentName = true;
        }

        if (this.ModalContent.action) {
            this.Action = this.ModalContent.action;
        } else {
            this.Action = 'Delete';
        }
    }

    nameEntered(): boolean {
        return this.Name === this.CorrectName
            && (this.HasParentName ? this.ParentName === this.CorrectParentName : true);
    }

    delete(): void {
        this.deleting = true;
        this.completeDelete.emit({ name: this.Name, parentName: this.HasParentName ? this.ParentName : null});
    }

    dismiss(): void {
        this.activeModal.dismiss();
    }

}
