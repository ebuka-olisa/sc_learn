import { Subscription } from 'rxjs';
import { Component, OnInit, Renderer2, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
// import * as $ from 'jquery';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, AfterViewInit, OnDestroy {

    admin: any; // MyUser;
    timeStamp!: number;

    ActivePage!: string;

    PageHeadingPrefix!: string;
    PageHeading!: string;
    PageSubHeading!: string;

    ShowBackButton!: boolean;
    isProductMenuCollapsed = true;

    ParentUrl!: string;
    HomeUrl!: string;

    navigationSubscription!: Subscription;

    constructor(private authService: AuthService,
                private route: ActivatedRoute,
                private router: Router,
                private renderer: Renderer2) {
        // add css class to body
        this.renderer.addClass(document.body, 'admin-layout');
    }

    ngOnInit(): void {

        // get logged in user
        this.admin = this.authService.getUser();

        // configure menu
        this.adjustMenu(window);

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
        const routeData = this.route.snapshot.data;
        const firstChildData = this.route.snapshot.firstChild?.data;
        this.ShowBackButton = firstChildData?.showBackButton !== null ? firstChildData?.showBackButton : false;
        this.ParentUrl = this.ShowBackButton ? firstChildData?.parentUrl : null;
        this.HomeUrl = routeData.home !== undefined ? routeData.home : null;
        this.ActivePage = routeData.activePage || firstChildData?.activePage;
        /* if (this.ActivePage === 'products' || this.ActivePage === 'product_categories' 
            || this.ActivePage === 'product_extra_attributes') {
            this.isProductMenuCollapsed = false;
        }*/
    }

    logOut(): void {
        this.authService.logout();
        this.router.navigate(['/scl-admin/login']);
    }


    // UI Operations
    @HostListener('window:resize', ['$event'])
    onResize(event: { target: any; }): void {
        this.adjustMenu(event.target);
        /*setTimeout(() => {
            this.adjustMenu(event.target);
        }, 200);*/
    }

    toggleSidebar(): void {
        $('body').hasClass('mini-sidebar') ?
        (
            $('body').trigger('resize'),
            $('.scroll-sidebar, .slimScrollDiv').css('overflow', 'hidden').parent().css('overflow', 'visible'),
            $('body').removeClass('mini-sidebar'), $('.navbar-brand span').show()
        )
        :
        (
            $('body').trigger('resize'),
            $('.scroll-sidebar, .slimScrollDiv').css('overflow-x', 'visible').parent().css('overflow', 'visible'),
            $('body').addClass('mini-sidebar'), $('.navbar-brand span').hide()
        );
    }

    toggleHiddenSidebar(): void {
        $('body').toggleClass('show-sidebar'), $('.nav-toggler i').toggleClass('mdi mdi-menu'),
            $('.nav-toggler i').addClass('mdi mdi-close');
    }

    adjustMenu(window: Window & typeof globalThis): void {
        if (window.innerWidth >= 1170) {
            if ($('body').hasClass('mini-sidebar')) {
                $('body').trigger('resize'),
                $('.scroll-sidebar, .slimScrollDiv').css('overflow', 'hidden').parent().css('overflow', 'visible'),
                $('body').removeClass('mini-sidebar'), $('.navbar-brand span').show();
            }
        } else {
            if (!$('body').hasClass('mini-sidebar')) {
                $('body').trigger('resize'),
                $('.scroll-sidebar, .slimScrollDiv').css('overflow-x', 'visible').parent().css('overflow', 'visible'),
                $('body').addClass('mini-sidebar'), $('.navbar-brand span').hide();
            }
        }
    }

    onActivate(event: any): void {
        window.scroll(0, 0);
        // or document.body.scrollTop = 0;
        // or document.querySelector('body').scrollTo(0,0)
    }


    // User Info
    getUserProfileImage(): string {
        /*if (this.timeStamp && this.admin.photoUrl) {
            return this.admin.photoUrl + '?' + this.timeStamp;
        }
        return this.admin.photoUrl;*/
        return '';
    }

    refreshUserInfo(): void {
        // this.authService.clearCurrentUser();
        this.timeStamp = (new Date()).getTime();
        // this.staff = this.authService.getUser();
    }

}
