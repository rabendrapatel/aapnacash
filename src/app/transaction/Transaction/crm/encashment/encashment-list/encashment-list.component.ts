import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { Constant } from 'src/app/constant/constant';
import { AuthService } from 'src/app/services/auth.service';
import { HttpService } from 'src/app/services/http.service';
import { ReqMethod } from 'src/app/shared/function/method';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-encashment-list',
  templateUrl: './encashment-list.component.html',
  styleUrls: ['./encashment-list.component.scss'],
  providers: [DialogService, ConfirmationService]
})
export class EncashmentListComponent implements OnInit {

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
    public authService: AuthService,
    private router: Router,
    private dbService: NgxIndexedDBService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.initilizeForm();
    this.getPurchaseCurrencyList(0);
  }

  initilizeForm() {
    this.searchForm = this.formBuilder.group({
      name: [''],
      mobileNo: [''],
      transactionNo: [''],
      totalRecord: [10],
    });
  }

  search() {
    this.paginationIndex = 1;
    this.getPurchaseCurrencyList(0);
    this.pg.firstPage();
  }

  resetSearch() {
    this.searchForm.reset();
    this.searchForm.controls['totalRecord'].setValue(10);
    this.getPurchaseCurrencyList(0);
    this.dt.clear();
    this.pg.firstPage();
  }

  onChangePage(event) {
    let offSet = (event.pageIndex * this.searchForm.value.totalRecord);
    this.paginationIndex = offSet + 1;
    this.getPurchaseCurrencyList(offSet);
  }

  getPurchaseCurrencyList(offsets) {
    this.loadingText = 'Fetching list. Please wait...';
    this.spinner.show('main-spiner');

    const searchForm = this.searchForm.value;
    const data = {
      name: searchForm.name,
      mobileNo: searchForm.mobileNo,
      transactionNo: searchForm.transactionNo,
    }

    let url = "/api/v1/encashment/get/encashment/invoice/list?size="
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

  getSubPurchaseCurrencyListList(event) {
    let invoiceNo = (event.data)
      ? event.data.invoiceNo : event;

    if (this.subList[invoiceNo] && this.subList[invoiceNo].length>0) {
      return false;
    }

    this.loadingText = 'Fetching list. Please wait...';
    this.spinner.show('main-spiner');

    const data = { invoiceNo: invoiceNo }

    let url = "/api/v1/encashment/get/encashment/list"
      + "?size=10000000&page=" + 0;
    this.httpService.callAuthApi(url, data, ReqMethod.POST)
      .subscribe(data => {
        this.spinner.hide('main-spiner');
        if (data.respCode === Constant.respCode200) {
          this.subList[invoiceNo] = data.payload.content;
          this.dt.clear();
        } else {
          this.subList[invoiceNo] = [];
          this.dt.clear();
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.hide('main-spiner');
        this.subList[invoiceNo] = [];
        this.dt.clear();
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });


  }

  editData(rowData) {
    this.loadingText = 'Fetching record. Please wait...';
    this.spinner.show('main-spiner');

    this.dbService.clear('currency').subscribe((dKey) => {
        this.dbService.add('currency', rowData)
        .subscribe((key) => {
          this.spinner.hide('main-spiner');
          this.router.navigate(['transaction/modifyencashment']);
        });
    });

  }

  deleteData(rowData: any) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to proceed?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loadingText = 'Deleting . Please wait...';
        this.spinner.show('main-spiner');
        let  id = rowData.id ;
        let invoiceNo = rowData.invoiceNo ;

        let url = "/api/v1/encashment/delete/encashment?id="+id;
        this.httpService.callAuthApi(url, {}, ReqMethod.GET)
          .subscribe(data => {
            this.spinner.hide('main-spiner');
            if(data.respCode==Constant.respCode200){
                this.toastr.success(data.respDescription);
                this.subList[invoiceNo]=[];
                this.getSubPurchaseCurrencyListList(invoiceNo);
            } else {
                this.toastr.error(data.respDescription);
            }
          }, (err: HttpErrorResponse) => {
            this.spinner.hide('main-spiner');
            if (err.error instanceof Error) {
              this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
            } else {
              this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
            }
        });
      }
    });
  }


  printPdf(rowData:any){
    let invoiceNo = rowData.invoiceNo;
    var h = 650; var w = 800; 
    var left = (screen.width/2)-(w/2);
    var top = (screen.height/2)-(h/2);
    let url = environment.backEndUrl+"/api/v1/encashment/get/encashment/pdf?invoiceNo="+invoiceNo;
    return window.open(url, "Pdf Viewer", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
  }
}
