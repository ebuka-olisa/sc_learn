import { ListViewModel } from './learning-path';

export class LessonListViewModel extends ListViewModel {
    id!: number;
    name!: string;
    index!: number;
    isActive!: boolean | string;
    canDelete?: boolean;
}

export class LessonViewModel extends ListViewModel {
    id!: number;
    name!: string;
    photos: Photo[] = [];
}

export class LessonCreateViewModel {
    id!: number;
    name!: string;
    description!: string;
    video!: VideoViewModel;
    note!: string;
    assessment!: string;
    thumbnail!: Photo;
    photos: Photo[] = [];
}

export class VideoViewModel {
    id!: number;
    name!: string;
    url!: string;
}

export class Photo{
    id!: number;
    url!: string;
    name!: string;
    deleted?: boolean;
}
