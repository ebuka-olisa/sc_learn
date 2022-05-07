import { Injectable } from '@angular/core';
import { AdminSharedModule } from './admin-shared.module';

@Injectable({
    providedIn: 'any'
})
export class AdminSharedService {

    StatusOptions: StatusOption[] = [
        {name: 'Active', value: 'true', iconClass: 'active'},
        {name: 'Inactive', value: 'false', iconClass: ''}
    ];

    DescriptionTextAreaConfig: any = {
        base_url: '/assets/tinymce',
        suffix: '.min',
        height: 150,
        // max_height: 300,
        statusbar: false,
        menubar: false,
        toolbar_drawer: 'floating',
        plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount'
        ],
        toolbar:
            'undo redo | bold italic underline strikethrough | forecolor formatselect | \
            bullist numlist outdent indent | link removeformat fullscreen',
        setup(editor: any): void {
            editor.on('focus', (e: any) => {
                jQuery(editor.editorContainer).addClass('focus'); // editor.contentAreaContainer
            });
            editor.on('blur', (e: any) => {
                jQuery(editor.editorContainer).removeClass('focus');
            });
        }
    };

    StatusSelectizeConfig = {
        labelField: 'name',
        valueField: 'value',
        searchField: 'name',
        maxItems: 1,
        highlight: false,
        create: false,
        closeAfterSelect: true,
        render: {
            item(item: { iconClass: any; name: any; }, escape: (arg0: any) => string): string { // selection
                const buildString = '<div><span class="font-14"><span class="dot ' + escape(item.iconClass) + '"></span>'
                    + escape(item.name) + '</span></div>';
                return buildString;
            },
            option(item: { iconClass: any; name: any; }, escape: (arg0: any) => string): string {
                const buildString = '<div><span class="font-14"><span class="dot ' + escape(item.iconClass) + '"></span>'
                    + escape(item.name) + '</span></div>';
                return buildString;
            }
        },
        // dropdownParent: 'body',
        // placeholder: 'Select Parent Category'
        // items: [] -> initial selected values
    };

    NormalSelectizeConfig = {
        labelField: 'name',
        valueField: 'id',
        searchField: 'name',
        maxItems: 1,
        highlight: true,
        create: false,
        closeAfterSelect: true,
        render: {
            item(item: { parent: null; name: any; }, escape: (arg0: any) => string): string {
                let buildString = '';
                buildString = '<div><span class="font-14">' + escape(item.name) + '</span></div>';
                return buildString;
            },
            option(item: { parent: null; name: any; }, escape: (arg0: any) => string): string {
                let buildString = '';
                buildString = '<div><span class="font-14">' + escape(item.name) + '</span></div>';
                return buildString;
            }
        },
        // dropdownParent: 'body',
        // placeholder: 'Select Parent Category'
        // items: [] -> initial selected values
    };

}

export class StatusOption {
    name!: string;
    value!: string;
    iconClass!: string;
}
