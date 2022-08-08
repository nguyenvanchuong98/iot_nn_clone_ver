import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonInfiniteScroll, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { DieuKhienService } from 'src/app/core/services/dieu-khien.service';
import { RpcScheduleDto } from 'src/app/shared/models/dieukhien.model';
import { PageData } from 'src/app/shared/models/page/page-data';
import { PageLink } from 'src/app/shared/models/page/page-link';
import { Direction } from 'src/app/shared/models/page/sort-order';
import { arrayEqual } from 'src/app/shared/utils';

@Component({
  selector: 'app-tab-hen-gio-dieu-khien',
  templateUrl: './tab-hen-gio-dieu-khien.component.html',
  styleUrls: ['./tab-hen-gio-dieu-khien.component.scss'],
})
export class TabHenGioDieuKhienComponent implements OnInit {
  timeoutRef = null;
  isLoading = false;
  listRpcSchedule: RpcScheduleDto[] = [];
  pageLink: PageLink;
  isFirstInit = 0;
  sortOrder = {
    property: 'createdTime',
    direction: Direction.DESC,
  };
  @Input() damTomId: string;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  constructor(
    private dieuKhienService: DieuKhienService,
    private toastCtrl: ToastController,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((data) => {
      clearTimeout(this.timeoutRef);
      if (this.isFirstInit === 1){
        return;
      }
      this.listRpcSchedule = [];
      this.pageLink = new PageLink(10, 0, '', this.sortOrder);
      // this.infiniteScroll.disabled = true;
      if (this.damTomId == null){
        return;
      }
      this.fetchDsHenGio();
    });
  }
  // tslint:disable-next-line: use-lifecycle-interface
  ngOnChanges(changes: SimpleChanges) {
    this.isFirstInit ++;
    if (this.damTomId == null){
      return;
    }
    this.listRpcSchedule = [];
    if (this.infiniteScroll != null){
      this.infiniteScroll.disabled = false;
    }
    this.pageLink = new PageLink(10, 0, '', this.sortOrder);
    if (this.pageLink != null){
      this.pageLink.page = 0;
    }
    this.fetchDsHenGio();
  }
  fetchDsHenGio(event?) {
    this.dieuKhienService
      .getRpcScheduleByPage(this.damTomId, this.pageLink)
      .pipe(
        map((pageData: PageData<RpcScheduleDto>) => {
          if (pageData.data.length > 0) {
            this.listRpcSchedule = this.listRpcSchedule.concat(pageData.data);
            if (event !== undefined) {
              if (event.type === 'ionInfinite') {
                event.target.complete();
              }
            }
            // Check Page has next
            if (pageData.hasNext === false) {
              this.infiniteScroll.disabled = true;
            } else {
              this.infiniteScroll.disabled = false;
            }
          } else {
            this.infiniteScroll.disabled = true;
          }
          this.isLoading = false;
        }),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError((error) => {
          this.infiniteScroll.disabled = true;
          return null;
        })
      )
      .subscribe();
  }
  // Ham nay bi loi khi xoa thiet bi : 417
  // getAllRpcSchedule(damTomId: string) {
  //   this.dieuKhienService.getAllRpcSchedule(damTomId).subscribe(data => {
  //     this.isLoading = false;
  //     if (!data) { data = []; }

  //     // trungdt - kiểm tra nếu dữ liệu thay đổi thì mới cập nhật
  //     if (!arrayEqual(data, this.listRpcSchedule)) {
  //       this.listRpcSchedule = data;
  //     }

  //     console.log(this.listRpcSchedule);
  //   },
  //     error => {
  //       console.log('error -------- ', error);
  //       this.isLoading = false;
  //     }
  //   );
  // }

  onChangeScheduleStatus(status, index) {
    // if (!!this.rollbacking) {
    //   this.rollbacking = false;
    //   return;
    // }
    this.listRpcSchedule[index].active = status;

    this.dieuKhienService
      .updateRpcSchedule(
        this.listRpcSchedule[index].id,
        this.listRpcSchedule[index]
      )
      .subscribe(
        () => {
          this.toastCtrl
            .create({
              message: 'Thay đổi trạng thái thành công',
              color: 'success',
              duration: 1000,
            })
            .then((toastCtrl) => {
              toastCtrl.present();
            });
        },
        (error) => {
          this.timeoutRef = setTimeout(() => {
            this.listRpcSchedule[index].active = !status;
          }, 100);

          this.toastCtrl
            .create({
              message: 'Thay đổi trạng thái thất bại',
              color: 'danger',
              duration: 1000,
            })
            .then((toastCtrl) => {
              toastCtrl.present();
            });
        }
      );
  }
  loadData(event) {
    if (this.pageLink.page !== undefined) {
      this.pageLink.page++;
    }
    this.fetchDsHenGio(event);
  }
}
