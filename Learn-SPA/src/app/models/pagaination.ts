export interface Pagination {
    currentPage: number;
    itemsPerPage: number;
    totalCount: number;
    maxSize: number;
    rotate: boolean;
}

export class PaginatedResult<T> {
    result!: T;
    pagination!: Pagination;
}