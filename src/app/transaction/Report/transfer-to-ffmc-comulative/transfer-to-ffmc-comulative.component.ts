import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { Constant } from 'src/app/constant/constant';
import { HttpService } from 'src/app/services/http.service';
import { formateDate } from 'src/app/shared/function/function';
import { ReqMethod } from 'src/app/shared/function/method';

@Component({
  selector: 'app-transfer-to-ffmc-comulative',
  templateUrl: './transfer-to-ffmc-comulative.component.html',
  styleUrls: ['./transfer-to-ffmc-comulative.component.scss'],
  providers:[DialogService]
})
export class TransferToFfmcComulativeComponent implements OnInit {

  @ViewChild(Table) dt: Table;
  @ViewChild('paginator') pg: MatPaginator;

  public loadingText: string;
  public searchForm: FormGroup;
  public list: any[];
  public subList = {};
  public totalRecord = 0;
  public paginationIndex = 1;

  constructor(
    public dialogService: DialogService,
    private spinner: NgxSpinnerService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private httpService: HttpService,
  ) { }

  ngOnInit(): void {
    this.initilizeForm();
    this.getFfmcComulativeReport(0);
  }

  initilizeForm() {
    this.searchForm = this.formBuilder.group({
      fromDate: [''],
      toDate: [''],
      totalRecord: [10],
    });
  }

  search() {
    this.paginationIndex = 1;
    this.getFfmcComulativeReport(0);
    this.pg.firstPage();
  }

  resetSearch() {
    this.searchForm.reset();
    this.searchForm.controls['totalRecord'].setValue(10);
    this.searchForm.controls['fromDate'].setValue("");
    this.searchForm.controls['toDate'].setValue("");
    this.getFfmcComulativeReport(0);
    this.dt.clear();
    this.pg.firstPage();
  }

  onChangePage(event) {
    let offSet = (event.pageIndex * 
      this.searchForm.value.totalRecord);
    this.paginationIndex = offSet + 1;
    this.getFfmcComulativeReport(offSet);
  }

  getFfmcComulativeReport(offsets) {

    this.loadingText = 'Fetching list. Please wait...';
    this.spinner.show('main-spiner');

    const searchForm = this.searchForm.value;
    const data = {
      fromDate: formateDate(searchForm.fromDate),
      toDate: formateDate(searchForm.toDate),
    }

    let url = "/api/v1/report/get/ffmc/comulative/report?size="
      + searchForm.totalRecord + "&page=" + offsets;
    this.httpService.callAuthApi(url, data, ReqMethod.POST)
      .subscribe(data => {
        this.spinner.hide('main-spiner');

        if (data.respCode === Constant.respCode200) {
          this.list = data.payload.content;
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


}
