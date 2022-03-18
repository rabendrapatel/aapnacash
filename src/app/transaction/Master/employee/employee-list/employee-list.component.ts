import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import {  Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { Constant } from 'src/app/constant/constant';
import { HttpService } from 'src/app/services/http.service';
import { SharedService } from 'src/app/services/shared.service';
import { getKeyValue } from 'src/app/shared/function/function';
import { ReqMethod } from 'src/app/shared/function/method';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
  providers: [DialogService]

})
export class EmployeeListComponent implements OnInit {

  @ViewChild(Table) dt: Table;
  @ViewChild('paginator') pg: MatPaginator;

  public loadingText: string;
  public searchForm: FormGroup;
  public list: any[];
  public roleList: any[];

  public paginationIndex = 1;
  public totalRecord = 0;

  constructor(
    public dialogService: DialogService,
    private spinner: NgxSpinnerService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private httpService: HttpService,
    private router: Router,
    private shared: SharedService,
  ) { }

  ngOnInit(): void {
    this.initilizeForm();
    this.getAllRoleList();
    this.getEmployeeList(0);
  }

  initilizeForm() {
    this.searchForm = this.formBuilder.group({
      name: [''],
      mobileNo: [''],
      roleId: [''],
      email: [''],
      totalRecord: [10],
    });
  }

  search() {
    this.paginationIndex = 1;
    this.getEmployeeList(0);
    this.pg.firstPage();
  }

  resetSearch() {
    this.searchForm.reset();
    this.searchForm.controls['totalRecord'].setValue(10);
    this.getEmployeeList(0);
    this.dt.clear();
    this.pg.firstPage();
  }

  onChangePage(event) {
    let offSet = (event.pageIndex * this.searchForm.value.totalRecord);
    this.paginationIndex = offSet + 1;
    this.getEmployeeList(offSet);
  }


  getEmployeeList(offsets) {
    this.loadingText = 'Fetching list. Please wait...';
    this.spinner.show('main-spiner');

    const searchForm = this.searchForm.value;
    const data = {
      name: searchForm.name,
      roleId: getKeyValue(searchForm,'roleId','id',0),
      mobileNo:searchForm.mobileNo,
      email:searchForm.email,
    }

    let url = "/api/v1/user/get/user/list?size="
      + searchForm.totalRecord + "&page=" + offsets;
    this.httpService.callAuthApi(url, data, ReqMethod.POST)
      .subscribe(data => {
        this.spinner.hide('main-spiner');

        if (data.respCode === Constant.respCode200) {
            this.list = data.payload.content;
          console.log(this.list)

            this.totalRecord = data.payload.totalElements;
            this.dt.clear();
        } else {
            this.list = [];
            this.dt.clear();
        }
      }, (err: HttpErrorResponse) => {
          this.spinner.hide('main-spiner');
          this.list = [];
          this.dt.clear();
          if (err.error instanceof Error) {
            this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
          } else {
            this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
          }
      });
  }

  editData(rowData) {
      this.shared.setData(rowData,"empData");
      this.router.navigate(['transaction/employeemodification']);
  }

  getAllRoleList() {

    let url = "/api/v1/master/get/role/list";
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        if (data.respCode === Constant.respCode200) {
          let tempList = new Array();
          data.payload.forEach(elm => {
            tempList.push({
              id: elm.id,
              name: elm.roleName
            });
          });
          this.roleList = tempList;
        } else {
          this.roleList = [];
        }
      }, (err: HttpErrorResponse) => {
        this.roleList = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });

  }

}
