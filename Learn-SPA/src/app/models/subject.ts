import { Photo } from "./lesson";

export class SubjectListViewModel {
    id!: number;
    name!: string;
    isActive!: boolean;
}

export class SubjectEditViewModel {
    id!: number;
    name!: string;
    canDelete?: boolean;
    isActive!: boolean | string;
    description!: string;
    graphic!: Graphic;
    colorCode!: string;
}

export class Graphic {
    id!: number;
    long!: Photo;
    short!: Photo;
    banner!: Photo;
    colorCode!: string;
}
