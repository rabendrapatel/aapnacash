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
  public viewBankDetails= new Object();

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
    //this.getPaymentMoodList();
    this.getPaymentTypeList();
    this.getTranTypeList();
  }

  ngOnInit(): void {
    this.initilizeForm();
  }

  get ffmcF() { return this.creationForm.controls; }
  get ffmcT() { return this.ffmcF.ffmc as FormArray; }

  initilizeForm() {
    this.creationForm = this.formBuilder.group({
      ffmc: new FormArray([])
    });

    for (let i = 0; i < 1; i++) {
      this.ffmcT.push(this.formBuilder.group({
        currency: ['',Validators.required],
        puchasecurrencyRate: [0,Validators.required],
        availableCurrencyAmount: [0,Validators.required],
        bookingCurrencyAmount: ['',Validators.required,],
        bookingCurrencyRate: ['',Validators.required],
        totalInrAmount: [0,Validators.required],

        bankName: [''],
        branchName: [''],
        address: [''],
        paymentMode: [''],
        paymentType: [''],
        transactionNo: ['',],
        transactionType: [''],
      },{
        validator: this.validateCurrency('availableCurrencyAmount','bookingCurrencyAmount')
      }));
    }

  }

  validateCurrency(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const availableControl = formGroup.controls['availableCurrencyAmount'];
      const matchingControl = formGroup.controls['bookingCurrencyAmount'];
      const currentCurrency = formGroup.controls['currency'];
      const  currencyId = getObjKeyVal(currentCurrency['value'],'id',0);

      // set error on matchingControl if validation fails
      if (matchingControl.value=="") {
        matchingControl.setErrors({ required: true });
        return;
      } else {
        matchingControl.setErrors(null);
      }


      if (availableControl.value < matchingControl.value) {
        matchingControl.setErrors({ lessMatch: true });
        return;
      } else {
        matchingControl.setErrors(null);
      }

      let totalSumOfSurrency = 0;
      let creationForm = this.creationForm.value;
      creationForm.ffmc.forEach((value, index, self) => {
        let element = creationForm.ffmc[index];
        let tmpCurrencyId = getObjKeyVal(element['currency'],'id',-1);
        if(currencyId==tmpCurrencyId){
          totalSumOfSurrency =totalSumOfSurrency+parseInt(element.bookingCurrencyAmount);
        }
      });

      if (availableControl.value < totalSumOfSurrency) {
        matchingControl.setErrors({ tootalLessMatch: true });
        return;
      } else {
        matchingControl.setErrors(null);
      }
    }
  }



  removeFfmsRow(row) {
    if (this.ffmcT.length > 1)
      this.ffmcT.removeAt(row);
  }

  addFfmcRow(row) {
    this.ffmcT.push(this.formBuilder.group({
      currency: ['',Validators.required],
      puchasecurrencyRate: [0,Validators.required],
      availableCurrencyAmount: [0,Validators.required],
      bookingCurrencyAmount: ['',Validators.required,],
      bookingCurrencyRate: ['',Validators.required],
      totalInrAmount: [0,Validators.required],

      bankName: [''],
      branchName: [''],
      address: [''],
      paymentMode: [''],
      paymentType: [''],
      transactionNo: ['',],
      transactionType: [''],
    },{
      validator: this.validateCurrency('availableCurrencyAmount','bookingCurrencyAmount')
    }));
  }

  showBankDetails(rowData,row){
    if(rowData.value.paymentMode.id==2){
      this.viewBankDetails[row] = true;
      let formCtrl = this.ffmcT.controls[row]['controls'];
      formCtrl['paymentType'].setValidators([Validators.required]);
      formCtrl['paymentType'].updateValueAndValidity();
      formCtrl['transactionNo'].setValidators([Validators.required]);
      formCtrl['transactionNo'].updateValueAndValidity();
      formCtrl['bankName'].setValidators([Validators.required]);
      formCtrl['bankName'].updateValueAndValidity();
      formCtrl['branchName'].setValidators([Validators.required]);
      formCtrl['branchName'].updateValueAndValidity();
    }else {
      this.viewBankDetails[row] = false;
      let formCtrl = this.ffmcT.controls[row]['controls'];
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

  getTotlaInrAmount(row){
    let form= this.ffmcT.value[row];
    let totalInr = form.bookingCurrencyAmount*form.bookingCurrencyRate;
    this.ffmcT.controls[row]['controls']['totalInrAmount'].setValue(totalInr);
  }



  transferToFfmc(){
    if (validateDynamicFormFields(this.creationForm,'ffmc')) {
      return;
    }
    

    this.loadingText = "Transfering to ffmc. Please wait.";
    this.spinner.show("main-spiner");

    let ffmcList = new Array();
    let creationForm = this.creationForm.value;
    creationForm.ffmc.forEach((value, index, self) => {
      let element = creationForm.ffmc[index];
      let tmp = {
        currency: getKeyValue(element,'currency','id',0),
        currencyAmount:getObjKeyVal(element,'bookingCurrencyAmount',0),
        sellCurrencyRate:getObjKeyVal(element,'bookingCurrencyRate',0),
        currencyRate:getObjKeyVal(element,'puchasecurrencyRate',0),
  
        address:getObjKeyVal(element,'address',''),
        bankName:getObjKeyVal(element,'bankName',''),
        branchName:getObjKeyVal(element,'branchName',''),
        paymentMode:getKeyValue(element,'paymentMode','id',0),
        paymentType:getKeyValue(element,'paymentType','id',0),
        transactionType:getKeyValue(element,'transactionType','id',0),
        transactionNo:getObjKeyVal(element,'transactionNo',0),
      }
      ffmcList.push(tmp);
    });

    let data = { ffmc:ffmcList }
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

  getCurrencyListById(event,row){
    let id = event.value.id;

    this.loadingText = "Fetching available currency. Please wait.";
    this.spinner.show("main-spiner");

    let url = "/api/v1/ffmc/get/currency/list/by/currency/id?currencyId="+id;
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        this.spinner.hide("main-spiner");
       
        if (data.respCode === Constant.respCode200) {
            let obj = data.payload;
            this.ffmcT.controls[row]['controls']['puchasecurrencyRate'].setValue(getObjKeyVal(obj,'purchaseRate',0));
            this.ffmcT.controls[row]['controls']['availableCurrencyAmount'].setValue(getObjKeyVal(obj,'totalAmount',0));
        } else {
          this.ffmcT.controls[row]['controls']['puchasecurrencyRate'].setValue(0);
          this.ffmcT.controls[row]['controls']['availableCurrencyAmount'].setValue(0);
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
