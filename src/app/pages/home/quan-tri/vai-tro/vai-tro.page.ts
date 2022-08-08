import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';
import { Subject, Subscription } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { RoleService } from 'src/app/core/services/role.service';
import { PageData } from 'src/app/shared/models/page/page-data';
import { PageLink } from 'src/app/shared/models/page/page-link';
import { Direction } from 'src/app/shared/models/page/sort-order';
import { Role } from 'src/app/shared/models/role.model';
import { IonContent } from '@ionic/angular';


@Component({
  selector: 'app-vai-tro',
  templateUrl: './vai-tro.page.html',
  styleUrls: ['./vai-tro.page.scss'],
})
export class VaiTroPage implements OnInit {
  // Event của infinite scroll để kiểm soát trạng thái load
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild(IonContent, { static: false })
  content: IonContent;
  isLoading = false;
  pageLink: PageLink;

  isGoTop = false;

  message = 'Không có dữ liệu';

  constructor(private roleService: RoleService,
              private router: Router) {
  }

  infiniteLoad = false;

  // Danh Sách vai trò sắp xếp theo
  sortOrder;

  // Danh sách vai trò
  vaiTroList: Role[] = [];

  ngOnInit() {
  }

  // Load lại data khi vào màn hình danh sách vai trò
  ionViewWillEnter() {
    this.isLoading = true;
    this.vaiTroList = [];
    if (this.infiniteScroll !== undefined){
      this.infiniteScroll.disabled = false;
    }
    this.sortOrder = {
      property: 'name',
      direction: Direction.ASC
    },
      this.pageLink = new PageLink(10, 0, '', this.sortOrder);
    this.initData();
  }

  // Load data
  fetchData(event?) {
    this.roleService
      .getTenantRoles(this.pageLink).pipe(
        map(
          (pageData: PageData<Role>) => {
            if (pageData !== null) {
              if (pageData.data.length > 0) {
                this.vaiTroList = this.vaiTroList.concat(pageData.data);
                // event != undefined và là event khi kéo infinite
                if (event !== undefined) {
                  if (event.type === 'ionInfinite') {
                    event.target.complete();
                  }
                }
                // Check Page has next
                if (pageData.hasNext === false) {
                  this.infiniteScroll.disabled = true;
                }

              }
              else {
                this.infiniteScroll.disabled = true;
              }
              this.isLoading = false;
            }
          }),
          finalize(() => {
            this.isLoading = false;
          }),
          catchError((error) => {
           this.message = 'Có lỗi xảy ra!';
           console.log(error);

           this.vaiTroList.length = 0;
           return null;
          }))
      .subscribe();
  }

  initData() {
     this.fetchData();
  }
  // Load thêm data khi kéo xuống dưới
  loadMore(e) {
    this.pageLink.page++;
    this.infiniteLoad = true;
    this.fetchData(e);
  }
  // Load item khi tìm kiếm
  findItems(e) {
    // Enabled lại infinite scroll
    this.infiniteScroll.disabled = false;
    // set lại trang bắt đầu = 0;
    this.pageLink.page = 0;
    const search = e.target.value;
    if (search && search.trim() !== '') {
      this.vaiTroList = [];
      this.pageLink.textSearch = search;
      this.fetchData(e);
    }
    else {
      this.vaiTroList = [];
      this.pageLink.textSearch = '';
      this.fetchData(e);
    }
  }

  // doRefresh(event) {
  //   setTimeout(() => {
  //    this.ionViewWillEnter();
  //    event.target.complete();
  //   }, 1000);
  // }

  clickArrow(vaiTroId){
    this.router.navigate(['/', 'home', 'quan-tri', 'vai-tro', 'thong-tin-vai-tro', vaiTroId]);
  }
  scrollToTop() {
    this.content.scrollToTop(0);
  }
  logScrolling(event){
    console.log(event);
    if (event.detail.scrollTop === 0){
      this.isGoTop = false;
    }
    else {
      this.isGoTop = true;
    }
  }
}
