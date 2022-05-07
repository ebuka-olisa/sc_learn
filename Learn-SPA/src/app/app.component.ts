import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PreloaderService } from './services/preloader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
    title = 'Accave';

    loadingView: boolean;
    navigationSubscription: Subscription = new Subscription();
    preloaderSubscription: Subscription = new Subscription();

    constructor(private router: Router, private loaderService: PreloaderService) {
        this.loadingView = true;
    }

    ngOnInit(): void {
        this.preloaderSubscription = this.loaderService.spinnerStatus.subscribe(state => {
            this.loadingView = state;
        });
    }

    ngAfterViewInit(): void {
        this.navigationSubscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.loaderService.showSpinner();
                // this.loadingView = true;
                // this.notificationService.clearAllToasts();
            } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
                this.loaderService.hideSpinner();
                // this.loadingView = false;
            }
        });
    }

    ngOnDestroy(): void {
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }

        if (this.preloaderSubscription) {
            this.preloaderSubscription.unsubscribe();
        }
    }
}
