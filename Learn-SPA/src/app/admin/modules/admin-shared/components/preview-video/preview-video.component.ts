import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-preview-video',
  templateUrl: './preview-video.component.html',
  styleUrls: ['./preview-video.component.scss']
})
export class PreviewVideoComponent implements OnInit {

    @Input() initialState: any;

    Url!: string;

    constructor(private activeModal: NgbActiveModal) {
    }

    ngOnInit(): void {
        // if in edit mode
        if (this.initialState && this.initialState.url) {
            this.Url = this.initialState.url;
        } else {
            this.close();
        }
    }

    close(): void {
        this.activeModal.dismiss();
    }

}
