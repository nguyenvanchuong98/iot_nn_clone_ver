import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertController,
  IonContent,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { QuantridamtomService } from 'src/app/core/services/quantridamtom.service';
import { DamtomCreate, DamtomD } from 'src/app/shared/models/damtom.model';

@Component({
  selector: 'app-them-moi-dam-tom',
  templateUrl: './them-moi-dam-tom.page.html',
  styleUrls: ['./them-moi-dam-tom.page.scss'],
})
export class ThemMoiDamTomPage implements OnInit {
  @ViewChild (IonContent, {static: true}) content: IonContent;

  formCreatedam: FormGroup;
  listDt: DamtomD[] = [];
  isExist = false;
  isGoTop = false;

  constructor(
    private damtomService: QuantridamtomService,
    private loadingCtl: LoadingController,
    private router: Router,
    private alertCtl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.damtomService.getListDamtom().subscribe((res: DamtomD[]) => {
      this.listDt = res;
    });
    this.formCreatedam = new FormGroup({
      tendamtom: new FormControl('', Validators.required),
      vitri: new FormControl(''),
      ghichu: new FormControl('', Validators.maxLength(4000)),
    });
  }

  // show toast
  private showToast(meseage: string, colorInput: string) {
    this.toastCtrl
      .create({
        message: meseage,
        color: colorInput,
        duration: 2000,
      })
      .then((toatEL) => toatEL.present());
  }

  async onCreateDamtom() {
    this.isExist = false;
    const CREATE_DAMTOMDTO = new DamtomCreate();
    CREATE_DAMTOMDTO.name = this.formCreatedam.value.tendamtom?.trim();
    CREATE_DAMTOMDTO.address = this.formCreatedam.value.vitri?.trim();
    CREATE_DAMTOMDTO.note = this.formCreatedam.value.ghichu?.trim();
    CREATE_DAMTOMDTO.active = true;
    CREATE_DAMTOMDTO.staffs = [];
    this.loadingCtl.create({ message: 'Đang lưu' }).then((loadEl) => {
      loadEl.present();
      this.damtomService.postDamtom(CREATE_DAMTOMDTO).subscribe(
        (res: any) => {
          if (res === 2){
            loadEl.dismiss();
            // const MESEAGE = "Tên đầm tôm đã tồn tại !";
            // const COLOR = "danger";
            // this.showToast(MESEAGE, COLOR);
            this.isExist = true;
          }
          else{
            loadEl.dismiss();
            this.router.navigate([
              './home/quan-tri/dam-tom/thong-tin-dam-tom',
              res?.id?.id,
            ]);
            const MESEAGE = 'Thêm mới thành công';
            const COLOR = 'success';
            this.showToast(MESEAGE, COLOR);
            this.formCreatedam.reset();
          }
        },
        () => {
          loadEl.dismiss();
          this.router.navigate(['/home/quan-tri/dam-tom']);
          const MESEAGE = 'Thêm mới thất bại';
          const COLOR = 'danger';
          this.showToast(MESEAGE, COLOR);
          this.formCreatedam.reset();
        }
      );
    });
  }
  changeNameDamtom(){
    this.isExist = false;
  }
  // check trùng tên đầm tôm
  // checktendamtom(tenCondi: string) {
  //   return this.listDt.find((el) => el.name.toLowerCase() === tenCondi.toLowerCase());
  // }
  // checkExist() {
  //   if (
  //     this.checktendamtom(this.formCreatedam.value.tendamtom?.trim()) !=
  //     undefined
  //   ) {
  //     this.isExist = true;
  //   } else {
  //     this.isExist = false;
  //   }
  // }

  // btn scroll top
  goTop(){
    this.content.scrollToTop(1500);
  }

  logScrolling(event){
    if (event.detail.scrollTop === 0){
      this.isGoTop = false;
    }
    else {
      this.isGoTop = true;
    }
  }
}
