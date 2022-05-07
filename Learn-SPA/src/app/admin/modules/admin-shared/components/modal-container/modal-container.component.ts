import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-container',
  template: ''
})
export class ModalContainerComponent implements OnDestroy, AfterViewInit {

    destroy = new Subject<any>();
    currentDialog!: NgbModalRef | null;
    subscription!: Subscription;

    constructor(private router: Router) { }

    ngOnDestroy(): void {
        this.destroy.next();
        // this.subscription.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.subscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                if (this.currentDialog) {
                    this.currentDialog.close();
                    this.currentDialog = null;
                    this.subscription.unsubscribe();
                }
            }
        });
    }

}
