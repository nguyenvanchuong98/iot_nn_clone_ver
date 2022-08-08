import {Component, ElementRef, OnInit, Output, ViewChild, EventEmitter, Input} from '@angular/core';
import {CameraResultType, CameraSource, Capacitor, Plugins} from '@capacitor/core';
import {ActionSheetController, Platform, ToastController} from '@ionic/angular';

function base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        const begin = sliceIndex * sliceSize;
        const end = Math.min(begin + sliceSize, bytesLength);

        const bytes = new Array(end - begin);
        for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, {type: contentType});
}

@Component({
    selector: 'app-upload-avatar',
    templateUrl: './upload-avatar.component.html',
    styleUrls: ['./upload-avatar.component.scss'],
})
export class UploadAvatarComponent implements OnInit {
    selectedAvatar: string;
    usePicker = false;
    @ViewChild('avatarPicker') avatarPickerRef: ElementRef<HTMLInputElement>;
    @Output() avatarPick = new EventEmitter<string | File>();
    @Input() avatarUrlLoad;
    megaBytes: number;

    constructor(
        private platform: Platform,
        private actionSheetCtrl: ActionSheetController,
        private toastCtrl: ToastController
    ) {
    }

    ngOnInit() {
        if ((this.platform.is('mobile') && !this.platform.is('hybrid')) ||
            this.platform.is('desktop')) {
            this.usePicker = true;
        }
    }

    async showActionSheetOption() {
        const actionSheet = await this.actionSheetCtrl.create({
            header: 'Thay đổi ảnh đại diện',
            buttons: [
                {
                    text: 'Chụp ảnh',
                    handler: () => {
                        this.takePhoto();
                    }
                },
                {
                    text: 'Chọn ảnh',
                    handler: () => {
                        this.chooseFromLibrary();
                    }
                },
            ]
        });
        await actionSheet.present();
    }

    takePhoto() {
        // if (!Capacitor.isPluginAvailable('Camera') || this.usePicker) {
        //     this.avatarPickerRef.nativeElement.click();
        //     return;
        // }
        Plugins.Camera.getPhoto({
            quality: 100,
            source: CameraSource.Camera,
            correctOrientation: true,
            width: 600,
            resultType: CameraResultType.DataUrl
        })
            .then(image => {
                const imageFile = base64toBlob(image.dataUrl.replace('data:image/jpeg;base64,', ''),
                    'image/jpeg/png');
                const bytesToMb = imageFile.size / 1048576;
                if (bytesToMb > 10) {
                    this.showToastNotify('Ảnh không được quá 10 MB!', 'danger');
                    return;
                } else {
                    this.avatarUrlLoad = image.dataUrl;
                    this.avatarPick.emit(this.avatarUrlLoad);
                }
            })
            .catch(error => {
                console.log(error);
                return false;
            });
    }

    chooseFromLibrary() {
        // if (!Capacitor.isPluginAvailable('Camera') || this.usePicker) {
        //     this.avatarPickerRef.nativeElement.click();
        //     return;
        // }
        Plugins.Camera.getPhoto({
            quality: 100,
            source: CameraSource.Photos,
            correctOrientation: true,
            width: 600,
            resultType: CameraResultType.DataUrl
        })
            .then(image => {
                const imageFile = base64toBlob(image.dataUrl.replace('data:image/jpeg;base64,', ''),
                    'image/jpeg/png');
                const bytesToMb = imageFile.size / 1048576;
                if (bytesToMb > 10) {
                    this.showToastNotify('Ảnh không được quá 10 MB!', 'danger');
                    return;
                } else {
                    this.avatarUrlLoad = image.dataUrl;
                    this.avatarPick.emit(this.avatarUrlLoad);
                }
            })
            .catch(error => {
                console.log(error);
                return false;
            });
    }

    chosenFile(event: Event) {
        const pickedFile = (event.target as HTMLInputElement).files[0];
        const byteImageConvertToMB = pickedFile.size / 1048576;
        if (byteImageConvertToMB > 10) {
            this.showToastNotify('Ảnh không được quá 10 MB!', 'danger');
        } else {
            const fileRead = new FileReader();
            fileRead.onload = () => {
                const dataUrl = fileRead.result.toString();
                this.avatarUrlLoad = dataUrl;
                this.avatarPick.emit(pickedFile);
            };
            fileRead.readAsDataURL(pickedFile);
        }
    }

    private showToastNotify(messageInfo: string, colorToast: string) {
        this.toastCtrl.create({
            message: messageInfo,
            duration: 2000,
            color: colorToast,
        }).then(toastEl => toastEl.present());
    }
}
