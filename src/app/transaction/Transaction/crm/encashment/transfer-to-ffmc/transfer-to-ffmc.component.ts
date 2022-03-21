import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Constant } from 'src/app/constant/constant';
import { HttpService } from 'src/app/services/http.service';
import { getKeyValue, getObjKeyVal, LessMatch, validateDynamicFormFields, validateFormFields } from 'src/app/shared/function/function';
import { ReqMethod } from 'src/app/shared/function/method';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-transfer-to-ffmc',
  templateUrl: './transfer-to-ffmc.component.html',
  styleUrls: ['./transfer-to-ffmc.component.scss']
})
export class TransferToFfmcComponent implements OnInit {

  public creationForm: FormGroup;
  public currentDate  : string;
  public loadingText: string;
  public currencyList: any = [];
  public paymentMoodList: any = [];
  public paymentTypeList: any = [];
  public tranTypeList: any = [];
  public viewBankDetails:boolean;

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    public toastr: ToastrService,
    public httpService: HttpService,
    private datePipe: DatePipe,
  ) { 
    this.currentDate = this.datePipe
    .transform(new Date(), 'dd-MM-yyyy');
    this.getCurrencyList();
    this.getPaymentMoodList();
    this.getPaymentTypeList();
    this.getTranTypeList();
  }

  ngOnInit(): void {
    this.initilizeForm();
  }

  initilizeForm() {
    this.creationForm = this.formBuilder.group({
        currency: ['',Validators.required],
        puchasecurrencyRate: [0,Validators.required],
        availableCurrencyAmount: [0,Validators.required],
        bookingCurrencyAmount: ['',Validators.required,],
        bookingCurrencyRate: ['',Validators.required],
        totalInrAmount: [0,Validators.required],

        bankName: [''],
        branchName: [''],
        address: [''],
        paymentMode: ['',Validators.required],
        paymentType: [''],
        transactionNo: ['',],
        transactionType: [''],
    }, {
      validator: LessMatch('availableCurrencyAmount','bookingCurrencyAmount')
    });
  }

  showBankDetails(rowData){
    if(rowData.value.paymentMode.id==2){
      this.viewBankDetails = true;
      let formCtrl = this.creationForm['controls'];
      formCtrl['paymentType'].setValidators([Validators.required]);
      formCtrl['paymentType'].updateValueAndValidity();
      formCtrl['transactionNo'].setValidators([Validators.required]);
      formCtrl['transactionNo'].updateValueAndValidity();
      formCtrl['bankName'].setValidators([Validators.required]);
      formCtrl['bankName'].updateValueAndValidity();
      formCtrl['branchName'].setValidators([Validators.required]);
      formCtrl['branchName'].updateValueAndValidity();
    }else {
      this.viewBankDetails = false;
      let formCtrl = this.creationForm['controls'];
      formCtrl['paymentType'].setValue("");
      formCtrl['transactionType'].setValue("");
      formCtrl['transactionNo'].setValue("");
      formCtrl['bankName'].setValue("");
      formCtrl['branchName'].setValue("");
      formCtrl['address'].setValue("");

      formCtrl['paymentType'].setValidators(null);
      formCtrl['paymentType'].updateValueAndValidity();
      formCtrl['transactionNo'].setValidators(null);
      formCtrl['transactionNo'].updateValueAndValidity();
      formCtrl['bankName'].setValidators(null);
      formCtrl['bankName'].updateValueAndValidity();
      formCtrl['branchName'].setValidators(null);
      formCtrl['branchName'].updateValueAndValidity();
    }
  }

  getTotlaInrAmount(){
    let form= this.creationForm.value;
    let totalInr = form.bookingCurrencyAmount*form.bookingCurrencyRate;
    this.creationForm.controls['totalInrAmount'].setValue(totalInr);
  }



  transferToFfmc(){
    if (validateFormFields(this.creationForm)) {
      return;
    }

    this.loadingText = "Transfering to ffmc. Please wait.";
    this.spinner.show("main-spiner");

    let creationForm = this.creationForm.value;

    let data = {
      currency: getKeyValue(creationForm,'currency','id',0),
      currencyAmount:getObjKeyVal(creationForm,'bookingCurrencyAmount',0),
      sellCurrencyRate:getObjKeyVal(creationForm,'bookingCurrencyRate',0),
      currencyRate:getObjKeyVal(creationForm,'puchasecurrencyRate',0),

      address:getObjKeyVal(creationForm,'address',''),
      bankName:getObjKeyVal(creationForm,'bankName',''),
      branchName:getObjKeyVal(creationForm,'branchName',''),
      paymentMode:getKeyValue(creationForm,'paymentMode','id',0),
      paymentType:getKeyValue(creationForm,'paymentType','id',0),
      transactionType:getKeyValue(creationForm,'transactionType','id',0),
    }

    let url = "/api/v1/ffmc/transfer/to/ffmc";
    this.httpService.callAuthApi(url,data,ReqMethod.POST)
      .subscribe(data => {
            this.spinner.hide("main-spiner");
            if(data.respCode==Constant.respCode200){
                let payload = data.payload;
                let invoice = payload.invoiceNo;
                this.ngOnInit();
                this.printInvoicePdf(invoice);
                this.toastr.success(data.respDescription);
            } else {
                this.toastr.error(data.respDescription);
            }
      },(err: HttpErrorResponse) => {
          this.spinner.hide ("main-spiner");
          if (err.error instanceof Error) {
              this.toastr.error('Client side error', 'Client error', {timeOut: 3000});
          } else {
              this.toastr.error('Server side error', 'Server error', {timeOut: 3000});
          }
      });
  }

  printInvoicePdf(invoiceNo:any){
    var h = 650; var w = 800; 
    var left = (screen.width/2)-(w/2);
    var top = (screen.height/2)-(h/2);
    let url = environment.backEndUrl+"/api/v1/ffmc/get/ffmc/pdf?invoiceNo="+invoiceNo;
    return window.open(url, "Pdf Viewer", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
  }

  getCurrencyList() {

    let url = "/api/v1/master/get/currency/list";
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        if (data.respCode === Constant.respCode200) {
          let tempList = new Array();
          data.payload.forEach(elm => {
            tempList.push({
              id: elm.id,
              name: elm.code+" - "+ elm.country,
            });
          });
          this.currencyList = tempList;
        } else {
          this.currencyList = [];
        }
      }, (err: HttpErrorResponse) => {
        this.currencyList = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });
  }

  getCurrencyListById(event){
    this.loadingText = "Fetching available currency. Please wait.";
    this.spinner.show("main-spiner");

    let id = event.value.id;
    let url = "/api/v1/ffmc/get/currency/list/by/currency/id?currencyId="+id;
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        this.spinner.hide("main-spiner");
       
        if (data.respCode === Constant.respCode200) {
            let obj = data.payload;
            this.creationForm.controls['puchasecurrencyRate'].setValue(getObjKeyVal(obj,'purchaseRate',0));
            this.creationForm.controls['availableCurrencyAmount'].setValue(getObjKeyVal(obj,'totalAmount',0));
        } else {
          this.creationForm.controls['puchasecurrencyRate'].setValue(0);
          this.creationForm.controls['availableCurrencyAmount'].setValue(0);
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.hide("main-spiner");
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });
  }

  getPaymentMoodList() {

    let url = "/api/v1/master/get/payment/mode/list";
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        if (data.respCode === Constant.respCode200) {
          let tempList = new Array();
          data.payload.forEach(elm => {
            tempList.push({
              id: elm.id,
              name: elm.paymentModeName
            });
          });
          this.paymentMoodList = tempList;
        } else {
          this.paymentMoodList = [];
        }
      }, (err: HttpErrorResponse) => {
        this.paymentMoodList = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });
  }

  getPaymentTypeList() {

    let url = "/api/v1/master/get/payment/type/list";
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        if (data.respCode === Constant.respCode200) {
          let tempList = new Array();
          data.payload.forEach(elm => {
            tempList.push({
              id: elm.id,
              name: elm.paymentTypeName
            });
          });
          this.paymentTypeList = tempList;
        } else {
          this.paymentTypeList = [];
        }
      }, (err: HttpErrorResponse) => {
        this.paymentTypeList = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });
  }

  getTranTypeList() {

    let url = "/api/v1/master/get/transaction/type/list";
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        if (data.respCode === Constant.respCode200) {
          let tempList = new Array();
          data.payload.forEach(elm => {
            tempList.push({
              id: elm.id,
              name: elm.tranTypeName
            });
          });
          this.tranTypeList = tempList;
        } else {
          this.tranTypeList = [];
        }
      }, (err: HttpErrorResponse) => {
        this.tranTypeList = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });
  }

}
