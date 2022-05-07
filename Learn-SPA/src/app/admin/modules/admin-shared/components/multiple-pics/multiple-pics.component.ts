import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DropzoneConfigInterface, DropzoneDirective } from 'ngx-dropzone-wrapper';
import { Photo } from 'src/app/models/lesson';

@Component({
  selector: 'app-multiple-pics',
  templateUrl: './multiple-pics.component.html',
  styleUrls: ['./multiple-pics.component.scss']
})
export class MultiplePicsComponent implements OnInit {

    @Input()
    set config(config: any){
        this._config = config;
        if (this._config.photos) {
            if (!this.isLoaded) {
                setTimeout(() => {
                    this.loadMockPicture(this._config.photos);
                }, 400);
            } else {
                this.loadMockPicture(this._config.photos);
            }
        }

        if (this._config.maxFiles) {
            this.dropzoneConfig.maxFiles = this._config.maxFiles;
        }
    }
    get config(): any { return this._config; }
    _config: any;

    @Output() picturesUpdated = new EventEmitter<any>();
    @Output() pictureDeleted = new EventEmitter<any>();

    Pictures: any[] = [];
    duplicatePicture!: boolean;
    Error!: string;
    isLoaded!: boolean;

    @ViewChild(DropzoneDirective, {static: false}) directiveRef!: DropzoneDirective;

    cssClass!: string;

    dropzoneConfig: DropzoneConfigInterface = {
        url: '/post',
        acceptedFiles: 'image/*',
        uploadMultiple: true,
        clickable: true,
        autoProcessQueue: false,
        addRemoveLinks: true,
        dictDefaultMessage: '<i class="fa fa-picture-o"></i>Drop pictures here or click to browse'
    };

    constructor() { }

    ngOnInit(): void {
        if (this.config.cssClass !== undefined){
            this.cssClass = this.config.cssClass;
        }

        if (this.config.photos) {
            if (!this.isLoaded) {
                setTimeout(() => {
                    this.loadMockPicture(this.config.photos);
                }, 400);
            } else {
                this.loadMockPicture(this.config.photos);
            }
        }
    }

    fileAdded(file: any): void {
        let sameFile = false;
        this.Pictures.some((obj: any) => {
            if (obj.name === file.name && obj.size === file.size) {
                sameFile = true;
                return;
            }
        });

        if (!sameFile) {
            this.Pictures.push(file);
            this.Error = '';
            this.picturesUpdated.emit(this.Pictures);
        } else {
            this.duplicatePicture = true;
            this.removeFileFromScreen(file);
        }
    }

    fileRemoved(file: any): void {
        if (this.duplicatePicture) {
            this.duplicatePicture = false;
        } else {
            const idx = this.Pictures.indexOf(file);
            if (this.Pictures[idx].photoId) {
                this.pictureDeleted.emit(this.Pictures[idx].photoId);
            }
            this.Pictures.splice(idx, 1);
            this.picturesUpdated.emit(this.Pictures);
        }
    }

    removeFileFromScreen(file: any): void {
        const dz = this.directiveRef.dropzone();
        dz.removeFile(file);
    }

    errorOccurred(file: any): void {
        if (!file.accepted) {
            this.removeFileFromScreen(file[0]);
        }
    }

    loadMockPicture(photos: Photo[]): void {
        this.isLoaded = true;
        const dz = this.directiveRef.dropzone();
        if (dz.files.length > 0) {
            dz.removeAllFiles();
        }
        for (const photo of photos) {
            const mockFile = {
                photoId: photo.id,
                name: photo.name,
                size: 1234,
                accepted: true
            };
            dz.files.push(mockFile);
            dz.emit('addedfile', mockFile);
            dz.emit('thumbnail', mockFile, photo.url);
            dz.emit('complete', mockFile);
        }
    }

}
