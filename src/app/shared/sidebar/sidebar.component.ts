import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Constant } from 'src/app/constant/constant';
import { AuthService } from 'src/app/services/auth.service';
import { HttpService } from 'src/app/services/http.service';
import { ReqMethod } from 'src/app/shared/function/method';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  public uiBasicCollapsed = false;
  public samplePagesCollapsed = false;

  public loadingText: string;
  public menuList: any[];

  constructor(
    public authService: AuthService,
    public httpService: HttpService,
    private spinner: NgxSpinnerService,
    public toastr: ToastrService,
  ) {
  }

  ngOnInit() {
    this.getAssetMasterList();
  }


  getAssetMasterList() {
    this.loadingText = 'Loading menu. Please wait...';
    this.spinner.show('main-spiner');

    let url = "/api/v1/menu/get/menu/list";
    this.httpService.callApi(url, {}, ReqMethod.GET)
      .subscribe(data => {

        this.spinner.hide('main-spiner');
        if (data.respCode === Constant.respCode200) {

          let menuList = [];
          let menuArray = data.payload;
          let assignPermission = this.authService
            .getPermission();

          for (let i = 0; i < menuArray.length; i++) {
            let temp = {};
            let menu = menuArray[i];

            if (assignPermission.includes(menu.fld_create) || assignPermission.includes(menu.fld_delete) || assignPermission.includes(menu.fld_export) || assignPermission.includes(menu.fld_modify) || assignPermission.includes(menu.fld_print) || assignPermission.includes(menu.fld_view)) {

              temp['label'] = menu.fld_name;
              temp['icon'] = menu.fld_icon;

              /** If no sub menu then add router link */
              if (menu.fld_link) {
                temp['routerLink'] = menu.fld_link;
              }

              /** If sub menu then add children */
              if (menu.children.length > 0) {
                let subMenuListl1 = [];
                let subMenuArrayL1 = menu.children;
                for (let j = 0; j < subMenuArrayL1.length; j++) {
                  let tempL1 = {};
                  let subMenuL1 = subMenuArrayL1[j];

                  if (assignPermission.includes(subMenuL1.fld_create) || assignPermission.includes(subMenuL1.fld_delete) || assignPermission.includes(subMenuL1.fld_export) || assignPermission.includes(subMenuL1.fld_modify) || assignPermission.includes(subMenuL1.fld_print) || assignPermission.includes(subMenuL1.fld_view)) {
                    tempL1['label'] = subMenuL1.fld_name;
                    tempL1['icon'] = subMenuL1.fld_icon;

                    /** If no sub menu L1 then add router link */
                    if (subMenuL1.fld_link) {
                      tempL1['routerLink'] = subMenuL1.fld_link;
                    }

                    /** If sub menu L1 then add children */
                    if (subMenuL1.children && subMenuL1.children.length > 0) {
                      let subMenuListl2 = [];
                      let subMenuArrayL2 = subMenuL1.children;
                      for (let k = 0; k < subMenuArrayL2.length; k++) {
                        let tempL2 = {};
                        let subMenuL2 = subMenuArrayL2[k];

                        if (assignPermission.includes(subMenuL2.fld_create) || assignPermission.includes(subMenuL2.fld_delete) || assignPermission.includes(subMenuL2.fld_export) || assignPermission.includes(subMenuL2.fld_modify) || assignPermission.includes(subMenuL2.fld_print) || assignPermission.includes(subMenuL2.fld_view)) {
                          tempL2['label'] = subMenuL2.fld_name;
                          tempL2['icon'] = subMenuL2.fld_icon;
                          tempL2['routerLink'] = subMenuL2.fld_link;
                          subMenuListl2.push(tempL2);
                        }
                      }
                      tempL1['items'] = subMenuListl2;
                    }

                    subMenuListl1.push(tempL1);
                  }
                }
                temp['items'] = subMenuListl1;
              }

              menuList.push(temp);
            }
          }

          this.menuList = menuList;
        } else {
          this.menuList = [];
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.hide('main-spiner');
        this.menuList = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });
  }

}
