import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Constant } from '../constant/constant';
import { HttpService } from '../services/http.service';
import { formateDate } from '../shared/function/function';
import { ReqMethod } from '../shared/function/method';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  public date = new Date();
  public currecnyList = [];
  public loadingText: string;
  public commonData:any = new Object();

  constructor(
    private httpService: HttpService,
    public toastr: ToastrService,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit() {
      this.getCommonData();
      this.getAvgCurrencyRate();
  }

  toggleProBanner(event) {
    event.preventDefault();
    document.querySelector('body').classList.toggle('removeProbanner');
  }

  getCommonData() {

    let url = "/api/v1/dashboard/get/dashboard/common/data";
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        this.spinner.hide('main-spiner');
        if (data.respCode === Constant.respCode200) {
          this.commonData =data.payload;
        } else {
          this.commonData =new Object();
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.hide('main-spiner');
        this.commonData =new Object();
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });

  }


  getAvgCurrencyRate() {

    this.loadingText = 'Fetching record. Please wait...';
    this.spinner.show('main-spiner');

    let fDate = formateDate(this.date);
    let url = "/api/v1/dashboard/get/dashboard/avg/currency/rate?date="+fDate;
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        this.spinner.hide('main-spiner');
        if (data.respCode === Constant.respCode200) {
          this.currecnyList =data.payload;
        } else {
          this.currecnyList = [];
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.hide('main-spiner');
        this.currecnyList = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });

  }


}
