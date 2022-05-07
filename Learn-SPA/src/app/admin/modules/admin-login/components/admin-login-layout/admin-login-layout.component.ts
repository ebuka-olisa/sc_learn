import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-admin-login-layout',
  templateUrl: './admin-login-layout.component.html',
  styleUrls: ['./admin-login-layout.component.css']
})
export class AdminLoginLayoutComponent implements OnInit, OnDestroy {

    constructor(private renderer: Renderer2) {
        // add css class to body
        this.renderer.addClass(document.body, 'admin-layout');
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {
        // remove css from body
        this.renderer.removeClass(document.body, 'admin-layout');
    }

}
