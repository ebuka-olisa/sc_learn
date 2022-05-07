import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-exit',
  templateUrl: './confirm-exit.component.html',
  styleUrls: ['./confirm-exit.component.scss']
})
export class ConfirmExitComponent implements OnInit {

    @Output() closeEditModal = new EventEmitter<any>();

    constructor(private activeModal: NgbActiveModal) { }

    ngOnInit(): void {}

    close(): void {
      this.activeModal.dismiss();
      // this.sharedService.navigateAwaySelection$.next(false);
    }

    discardChanges(): void {
      this.closeEditModal.emit();
      // this.sharedService.navigateAwaySelection$.next(true);
    }

}
