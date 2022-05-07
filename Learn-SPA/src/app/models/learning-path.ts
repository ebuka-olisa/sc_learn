/*===== LEARNING PATH =====*/
export class LearningPathListViewModel {
    id!: number;
    name!: string;
    isActive!: boolean;
    parent!: LearningPathListViewModel;
}

export class LearningPathEditViewModel {
    id!: number;
    name!: string;
    canDelete?: boolean;
    isActive!: boolean | string;
    description!: string;
    parent?: LearningPathListViewModel | null;
    parentId?: string;
}

export class ListViewModel{
    canDelete?: boolean;
    showActions?: boolean;
    holdButtonAppearance?: boolean;
    previousButtonHolder?: boolean;
}


/*===== LEARNING PATH SUBJECT =====*/
export class LearningPathSubjectListViewModel extends ListViewModel {
    id!: number;
    lPSubId!: number;
    name!: string;
    isActive!: boolean | string;
    isParent!: boolean;
}

export class LearningPathSubjectUpdateViewModel {
    id!: number;
    name!: string;
    active!: boolean | string;
}
