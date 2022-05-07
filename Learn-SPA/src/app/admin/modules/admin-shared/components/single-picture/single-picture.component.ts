import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DropzoneConfigInterface, DropzoneDirective } from 'ngx-dropzone-wrapper';
import { Photo } from 'src/app/models/lesson';

@Component({
  selector: 'app-single-picture',
  templateUrl: './single-picture.component.html',
  styleUrls: ['./single-picture.component.scss']
})
export class SinglePictureComponent implements OnInit, AfterViewInit {

    @Input()
    set config(config: any){
        this._config = config;
        this.reset();
        if (this._config.photo && this._config.photo.url !== '') {
            if (!this.isLoaded) {
                setTimeout(() => {
                    this.loadMockPicture(this._config.photo);
                }, 400);
            } else {
                this.loadMockPicture(this._config.photo);
            }
        } else if (this._config.selectedPicture) {
            if (!this.isLoaded) {
                setTimeout(() => {
                    this.loadSelectedPicture(this._config.selectedPicture);
                }, 400);
            }else {
                this.loadSelectedPicture(this._config.selectedPicture);
            }
        }
    }
    get config(): any { return this._config; }
    _config: any;

    @Input()
    set imageBackgroundColor(imageBackgroundColor: any){
        this._imageBackgroundColor = imageBackgroundColor;
        if (this._imageBackgroundColor.color) {
            // if (!this.isLoaded) {
            setTimeout(() => {
                this.setBackgroundColor();
            }, 400);
            /*} else {
                this.loadMockPicture(this._config.photo);
            }*/
        }
    }
    get imageBackgroundColor(): any { return this._imageBackgroundColor; }
    _imageBackgroundColor: any;

    // @Output() pictureRemovedEvent = new EventEmitter<any>();
    // @Output() newPictureSelectedEvent = new EventEmitter<any>();

    Picture: null | File = null;
    pictureRemoved!: boolean;
    replacementInProgress!: boolean;
    newPictureSelected!: boolean;
    Error!: string;
    isLoaded!: boolean;

    @ViewChild(DropzoneDirective, {static: false}) directiveRef!: DropzoneDirective;

    cssClass!: string;

    dropzoneConfig: DropzoneConfigInterface = {
        url: '/post',
        acceptedFiles: 'image/*',
        uploadMultiple: false,
        maxFiles: 1,
        clickable: true,
        autoProcessQueue: false,
        addRemoveLinks: true,
        dictDefaultMessage: '<i class="fa fa-picture-o"></i>Drop picture here or click to browse'
    };

    constructor(private elem: ElementRef) { }

    ngOnInit(): void {
        if (this.config.cssClass !== undefined){
            this.cssClass = this.config.cssClass;
        }
    }

    ngAfterViewInit(): void{
        /*if (this.imageBackgroundColor) {
            setTimeout(() => {
                // you'll get your through 'elements' below code
                const images = this.elem.nativeElement.querySelectorAll('.dz-image');
                // images[0].style.background = 'red';
                // console.log(images[0]);
            }, 1000);
        }*/
    }

    setBackgroundColor(): void {
        // you'll get your through 'elements' below code
        const images = this.elem.nativeElement.querySelectorAll('.dz-image');
        if (images[0]) {
            images[0].style.background = this._imageBackgroundColor.color;
        }
        // console.log(images[0]);
    }

    fileAdded(file: any): void {
        let sameFile = false;
        if (this.Picture != null && this.Picture.name === file.name && this.Picture.size === file.size) {
            sameFile = true;
        }

        if (!sameFile) {
            if (this.Picture || this.pictureRemoved){
                this.newPictureSelected = true;
            }

            this.Picture = file;
            // this.newPictureSelectedEvent.emit({file, newPicture: this.newPictureSelected});

            // replace picture if one is already being displayed
            const dz = this.directiveRef.dropzone();
            if (dz.files[1]) { // check to see if we have added a files to the files array
                this.replacementInProgress = true;
                dz.removeFile(dz.files[0]); // remove the existing file from the files array
            }

            if (this._imageBackgroundColor && this._imageBackgroundColor.color) {
                setTimeout(() => {
                    this.setBackgroundColor();
                }, 400);
            }
        }
    }

    fileRemoved(file: any): void {
        if (!this.replacementInProgress) {
            if (this.Picture) {
                this.pictureRemoved = true;
                this.Picture = null;
                // this.pictureRemovedEvent.emit();
            }
            this.newPictureSelected = false;
        } else {
            this.replacementInProgress = false;
        }
    }

    removeFileFromScreen(file: any): void {
        const dz = this.directiveRef.dropzone();
        this.replacementInProgress = true;
        dz.removeFile(file);
    }

    errorOccurred(file: any): void {
        if (!file.accepted) {
            this.removeFileFromScreen(file[0]);
        }
    }

    loadMockPicture(photo: Photo): void {
        this.isLoaded = true;
        const dz = this.directiveRef.dropzone();
        if (dz.files.length > 0) {
            dz.removeAllFiles();
        }
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

    loadSelectedPicture(file: any): void {
        this.isLoaded = true;
        const dz = this.directiveRef.dropzone();
        if (dz.files.length > 0) {
            dz.removeAllFiles();
        }
        const mockFile = {
            photoId: file.id,
            name: file.name,
            size: file.size,
            accepted: true
        };
        dz.files.push(mockFile);
        dz.emit('addedfile', mockFile);
        // dz.emit('thumbnail', mockFile, photo.url);
        dz.emit('complete', mockFile);
    }

    reset(): void {
        const dz = this.directiveRef ? this.directiveRef.dropzone() : null;
        if (dz && dz.files[0]) {
            dz.removeFile(dz.files[0]);
            this.Picture = null;
            this.newPictureSelected = false;
        }
    }

}
