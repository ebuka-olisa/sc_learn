import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Pagination } from 'src/app/models/pagaination';

@Component({
  selector: 'app-my-pagination',
  templateUrl: './my-pagination.component.html',
  styleUrls: ['./my-pagination.component.scss']
})
export class MyPaginationComponent implements OnInit {

    @Input() pagination!: Pagination;
    @Output() pageChanged = new EventEmitter();

    constructor() { }

    ngOnInit(): void {
    }

    emitPageChanged(newPageNumber: number): void {
        this.pageChanged.emit(newPageNumber);
    }

}
