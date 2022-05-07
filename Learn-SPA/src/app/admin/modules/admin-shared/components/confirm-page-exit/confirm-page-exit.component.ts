import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-confirm-page-exit',
  templateUrl: './confirm-page-exit.component.html',
  styleUrls: ['./confirm-page-exit.component.scss']
})
export class ConfirmPageExitComponent implements OnInit {

  subject!: Subject<boolean>;

  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit(): void {}

  close(): void {
    this.action(false);
  }

  discardChanges(): void {
    this.action(true);
  }

  action(value: boolean): void {
    this.activeModal.dismiss();
    this.subject.next(value);
    this.subject.complete();
  }

}
