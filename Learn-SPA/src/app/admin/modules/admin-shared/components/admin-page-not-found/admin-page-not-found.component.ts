import { Title } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-page-not-found',
  templateUrl: './admin-page-not-found.component.html',
  styleUrls: ['./admin-page-not-found.component.scss']
})
export class AdminPageNotFoundComponent implements OnInit {

    HomeURL!: string;

    constructor(private route: ActivatedRoute, titleService: Title) {
        titleService.setTitle('Page Not Found | Accave');
    }

    ngOnInit(): void {
        const home = this.route.snapshot.parent?.data.home || this.route.snapshot.parent?.parent?.data.home;
        if (home) {
            this.HomeURL = home;
        }
    }

}
