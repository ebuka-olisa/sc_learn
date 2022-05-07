import { LearningPathListViewModel, ListViewModel } from './learning-path';

export class LPSubjectTopicsAndSectionsViewModel {
    topics!: LearningPathSubjectTopicListViewModel[];
    section1!: number;
    section2!: number;
    section3!: number;
}

export class LearningPathSubjectTopicListViewModel extends ListViewModel {
    id!: number;
    name!: string;
    index!: number;
    isActive!: boolean | string;
    canDelete?: boolean;
}

export class LearningPathSubjectTopicUpdateViewModel {
    id!: number;
    name!: string;
    index!: number;
    learningPath?: LearningPathListViewModel[];
    isActive!: boolean | string;
}

export class Topic{
    id!: number;
    name!: string;
    description!: string;
}

export class LearningPathSubjectTopicCreateViewModel {
    id!: number;
    subjectId!: number;
    learningPathId!: number;
    topic!: Topic;
    section!: number | string;
    index!: number;
    isActive!: boolean | string;
}

export class LearningPathSubjectTopicEditViewModel {
    id!: number;
    name!: string;
    index!: number;
    description!: string;
    subjectId!: number;
    learningPathId!: number;
    learningPath!: LearningPathListViewModel[];
}
