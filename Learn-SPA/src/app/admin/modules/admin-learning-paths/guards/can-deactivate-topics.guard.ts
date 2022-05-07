import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of, Subject } from 'rxjs';
import { PreloaderService } from 'src/app/services/preloader.service';
import { ConfirmPageExitComponent } from '../../admin-shared/components/confirm-page-exit/confirm-page-exit.component';
import { AdminLearningPathsTopicsComponent } from '../components/admin-learning-paths-topics/admin-learning-paths-topics.component';

@Injectable()
export class CanDeactivateTopics implements CanDeactivate<AdminLearningPathsTopicsComponent>{
    modalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: 'static'
    };

    constructor(private modalService: NgbModal, private loaderService: PreloaderService) {}

    canDeactivate(
        component: AdminLearningPathsTopicsComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree {
        const spinnerStatusSubscription = this.loaderService.spinnerStatus.subscribe(value => {
            if (value) {
              this.loaderService.hideSpinner();
            }
        });

        if (component.rearrangeStarted) {
            const subject = new Subject<boolean>();
            const modalRef = this.modalService.open(ConfirmPageExitComponent, this.modalConfig);
            modalRef.componentInstance.subject = subject;
            spinnerStatusSubscription.unsubscribe();
            this.loaderService.hideSpinner();
            return subject.asObservable();
        } else {
            return of(true);
        }
    }
}
