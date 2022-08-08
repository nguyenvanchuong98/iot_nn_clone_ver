import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { of, Subscription } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { DieuKhienService } from 'src/app/core/services/dieu-khien.service';
import { QuantridamtomService } from 'src/app/core/services/quantridamtom.service';
import { CamerasType, DamtomD } from 'src/app/shared/models/damtom.model';
import { arrayEqual } from 'src/app/shared/utils';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.page.html',
  styleUrls: ['./camera.page.scss'],
})
export class CameraPage implements OnInit {
  @ViewChild(IonContent, { static: true }) content: IonContent;
  isGoTop = false;
  @ViewChild('video') myVideo: ElementRef;
  damtomIdDefault;
  camIdDefault: string;
  // urlMain: SafeResourceUrl;
  urlMain: string;
  nameMain: string;
  damtomlst: DamtomD[] = [];
  formCamera: FormGroup;
  LST_CAM: CamerasType[] = [];
  didChangeDam = false;
  damTomIdSubscription: Subscription;
  customActionSheetOptions: any = {
    header: 'Chọn nhà vườn',
    cssClass: 'my-custom-action-sheet',
  };
  lstUrl: SafeResourceUrl[] = [];
  cameraServerUrl;
  dumpUrl: SafeResourceUrl;
  wantLoad = true;
  isInit = false;
  @ViewChild('remoteVideo') remoteVideos: any;
  constructor(
    private fb: FormBuilder,
    private damtomService: QuantridamtomService,
    private route: ActivatedRoute,
    private dieuKhienService: DieuKhienService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    this.formCamera = this.fb.group({
      damtom: '',
    });
    this.isInit = true;
    this.damtomlst = await (
      await this.damtomService.getListDamtom().toPromise()
    ).filter((e) => {
      return e.active === true;
    });
    this.cameraServerUrl = await this.damtomService.getUrlServer().toPromise();
    if (this.damTomIdSubscription === undefined) {
      if (
        this.dieuKhienService.damTomId !== this.damtomIdDefault &&
        !!this.dieuKhienService.damTomId
      ) {
        this.damtomIdDefault = this.dieuKhienService.damTomId;
        this.formCamera.setValue({
          damtom: this.damtomIdDefault,
        });
      }
    }
    this.damTomIdSubscription =
      this.dieuKhienService.damTomIdSelected.subscribe((res) => {
        this.damtomIdDefault = res;
        // NB - change dam ngay khi subscribe
        this.formCamera.setValue({
          damtom: this.damtomIdDefault,
        });
      });
    this.route.queryParams.subscribe(async (data) => {
      this.didChangeDam = false;
      if (data !== undefined && data !== null) {
        this.camIdDefault = data.camId ? data.camId : '';
      }
      this.getCamOfDam();
    });
  }
  // Lấy danh sách đầm tôm
  getCamOfDam() {
    if (this.damtomIdDefault !== null && this.damtomIdDefault !== undefined) {
      // tslint:disable-next-line: no-shadowed-variable
      this.damtomService.getArrCam(this.damtomIdDefault).subscribe((res) => {
        if (!arrayEqual(this.LST_CAM, res.data)) {
          this.lstUrl = [];
          this.LST_CAM = res.data;
          this.LST_CAM.forEach((el) => {
            const urlChild = this.buildCameraLiveUrl(
              this.cameraServerUrl,
              el.url
            );
            this.lstUrl.push(urlChild);
          });
        }
        // Dat mac dinh video hien thi dau tien và sắp xếp các camera sau
        this.setCameraMain();
      });
      this.formCamera.setValue({
        damtom: this.damtomIdDefault,
      });
    } else if (this.damtomlst[0]) {
      // Lấy danh sách camera của đầm tôm đầu tiên
      // tslint:disable-next-line: no-shadowed-variable
      this.damtomService.getArrCam(this.damtomlst[0].id).subscribe((res) => {
        if (!arrayEqual(this.LST_CAM, res.data)) {
          this.lstUrl = [];
          this.LST_CAM = res.data;
          this.LST_CAM.forEach((el) => {
            const urlChild = this.buildCameraLiveUrl(
              this.cameraServerUrl,
              el.url
            );
            this.lstUrl.push(urlChild);
          });
        }
        // Dat mac dinh video hien thi dau tien và sắp xếp các camera sau
        this.setCameraMain();
      });
      this.formCamera.setValue({
        damtom: this.damtomlst[0].id,
      });
    }
  }
  // Sự kiện khi thay đổi đầm tôm
  chooseDamtom(event) {
    this.ngOnDestroy();
    if (this.didChangeDam) {
      this.dieuKhienService.damTomIdSelected.next(event.target.value);
      this.dieuKhienService.damTomId = event.target.value;
      this.damtomService.getArrCam(event.target.value).subscribe((res) => {
        if (!arrayEqual(this.LST_CAM, res.data)) {
          this.lstUrl = [];
          this.LST_CAM = res.data;
          this.LST_CAM.forEach((el) => {
            const urlChild = this.buildCameraLiveUrl(
              this.cameraServerUrl,
              el.url
            );
            this.lstUrl.push(urlChild);
          });
        }
        // Dat mac dinh video hien thi dau tien và sắp xếp các camera sau
        this.setCameraMain();
      });
      this.router.navigate(['.'], {
        relativeTo: this.route,
      });
    }
  }

  // Find video main
  findVideoMain() {
    let resultFind: CamerasType;
    resultFind = this.LST_CAM.find((ev) => ev.main === true);
    return resultFind;
  }
  // Set camera hiển thị chính
  setCameraMain() {
    this.wantLoad = true;
    this.LST_CAM.forEach((e) => {
      this.damtomService.getStatusStream(e.url).subscribe(
        (res) => {
          if (res === false) {
            e.disConnect = true;
          } else {
            e.disConnect = false;
          }
        },
        () => {
          e.disConnect = true;
        }
      );
    });
    if (this.camIdDefault !== '') {
      this.urlMain = this.LST_CAM.find((ev) => ev.id === this.camIdDefault).url;
      this.nameMain = this.LST_CAM.find(
        (ev) => ev.id === this.camIdDefault
      ).name;
      this.dumpUrl = this.buildCameraLiveUrl(
        this.cameraServerUrl,
        this.urlMain
      );
      setTimeout(() => {
        this.wantLoad = false;
      }, 3000);
    } else if (this.findVideoMain() !== undefined) {
      this.urlMain = this.findVideoMain().url;
      this.nameMain = this.findVideoMain().name;
      this.dumpUrl = this.buildCameraLiveUrl(
        this.cameraServerUrl,
        this.urlMain
      );
      setTimeout(() => {
        this.wantLoad = false;
      }, 3000);
    } else {
      this.urlMain = this.LST_CAM[0]?.url;
      this.nameMain = this.LST_CAM[0]?.name;
      this.dumpUrl = this.buildCameraLiveUrl(
        this.cameraServerUrl,
        this.urlMain
      );
      setTimeout(() => {
        this.wantLoad = false;
      }, 3000);
    }
    setTimeout(() => {
      this.LST_CAM.forEach((e) => {
        this.damtomService.getStatusStream(e.url).subscribe(
          (res) => {
            if (res === false) {
              e.disConnect = true;
            } else {
              e.disConnect = false;
            }
          },
          () => {
            e.disConnect = true;
          }
        );
      });
    }, 14000);
  }

  // Chọn camera để xem
  chooseCamera(indexinput: number) {
    this.ngOnDestroy();
    this.wantLoad = true;
    this.nameMain = this.LST_CAM[indexinput].name;
    this.dumpUrl = this.lstUrl[indexinput];
    setTimeout(() => {
      this.wantLoad = false;
    }, 3000);
  }
  buildCameraLiveUrl(url: string, urlCam) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      url + '/LiveApp/play.html?name=' + urlCam + '&playOrder=hls'
    );
  }
  ionViewWillEnter() {
    this.wantLoad = true;
    if (!this.isInit) {
      this.damtomService
        .getListDamtom()
        .pipe(
          map((data) => {
            return data.filter((e) => e.active === true);
          })
        )
        .subscribe((res) => {
          this.damtomlst = res;
        });
    }
  }
  ionViewWillLeave() {
    // var playPromise = this.myVideo?.nativeElement.pause();
    // if (playPromise !== undefined) {
    //   playPromise
    //     .then(function () {
    //       console.log("Video has stopped !");
    //     })
    //     .catch(function (error) {
    //       console.log("Error stop video", error);
    //     });
    // }
    // const videos = document.querySelectorAll('iframe, video');
    // Array.prototype.forEach.call(videos, (video) => {
    //   if (video.tagName.toLowerCase() === 'video') {
    //     video.pause();
    //   } else {
    //     const src = video.src;
    //     video.src = src;
    //   }
    // });
    this.LST_CAM = [];
    const iframe = document.querySelectorAll('.myVid');
    iframe.forEach((element) => {
      element.removeAttribute('src');
    });
    this.isInit = false;
  }

  // btn scroll top
  goTop() {
    this.content.scrollToTop(0);
  }
  logScrolling(event) {
    if (event.detail.scrollTop === 0) {
      this.isGoTop = false;
    } else {
      this.isGoTop = true;
    }
  }
  doRefresh(event) {
    setTimeout(() => {
      this.getCamOfDam();
      event.target.complete();
    }, 2000);
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {}
}
