import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-visitor-layout',
    templateUrl: './visitor-layout.component.html',
    styleUrls: ['./visitor-layout.component.scss']
})
export class VisitorLayoutComponent implements OnInit, AfterViewInit, OnDestroy {

    ActivePage!: string;
    navbarFixed = false;

    navigationSubscription!: Subscription;

    constructor(private router: Router, private renderer: Renderer2) {
        // add css class to body
        this.renderer.addClass(document.body, 'visitor-layout');
    }

    ngOnInit(): void {
        // get values to route to configure the layout
        this.processRoutingData();
    }

    ngOnDestroy(): void {
        // remove css from body
        this.renderer.removeClass(document.body, 'admin-layout');

        if (this.navigationSubscription) {
          this.navigationSubscription.unsubscribe();
        }
    }

    ngAfterViewInit(): void {
        this.navigationSubscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.processRoutingData();
            }
        });
    }

    processRoutingData(): void {
        // const routeData = this.route.snapshot.data;
        // const firstChildData = this.route.snapshot.firstChild?.data;
        // this.ShowBackButton = firstChildData?.showBackButton !== null ? firstChildData?.showBackButton : false;
        // this.ParentUrl = this.ShowBackButton ? firstChildData?.parentUrl : null;
        // this.HomeUrl = routeData.home !== undefined ? routeData.home : null;
        // this.ActivePage = routeData.activePage || firstChildData?.activePage;
        /* if (this.ActivePage === 'products' || this.ActivePage === 'product_categories'
            || this.ActivePage === 'product_extra_attributes') {
            this.isProductMenuCollapsed = false;
        }*/
    }


    // UI Operations
    @HostListener('window:scroll', ['$event']) onscroll(): void{
        if (window.scrollY > 30) {
            this.navbarFixed = true;
        } else {
            this.navbarFixed = false;
        }
    }

    onActivate(event: any): void {
        window.scroll(0, 0);
    }

}
