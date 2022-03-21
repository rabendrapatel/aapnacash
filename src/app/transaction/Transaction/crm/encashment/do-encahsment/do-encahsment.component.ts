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
import { getKeyValue, getObjKeyVal, validateDynamicFormFields } from 'src/app/shared/function/function';
import { ReqMethod } from 'src/app/shared/function/method';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-do-encahsment',
  templateUrl: './do-encahsment.component.html',
  styleUrls: ['./do-encahsment.component.scss'],
  providers: [DatePipe]
})
export class DoEncahsmentComponent implements OnInit {

  public creationForm: FormGroup;
  public currentDate  : string;
  public loadingText: string;

  public currencyList: any = [];
  public paymentMoodList: any = [];
  public paymentTypeList: any = [];
  public tranTypeList: any = [];
  public viewBankDetails = {};
  public rowData = {};

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    public toastr: ToastrService,
    public httpService: HttpService,
    private datePipe: DatePipe,
    private dbService: NgxIndexedDBService,
    private router: Router,
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
    this.dbService.getAll('customer').subscribe((data) => {
        this.rowData = data[0];
        this.initilizeForm();
    });
  }

  get encasementF() { return this.creationForm.controls; }
  get encasementT() { return this.encasementF.encasement as FormArray; }


  initilizeForm() {

    let obj = this.rowData;
    this.creationForm = this.formBuilder.group({
      encasement: new FormArray([])
    });


    for (let i = 0; i < 1; i++) {
      this.encasementT.push(this.formBuilder.group({
        id: [0],
        customerId: [getObjKeyVal(obj, 'id', 0),Validators.required],
        customerName: [{value: getObjKeyVal(obj, 'name', ''), disabled: true}],

        currency: ['',Validators.required],
        currencyAmount: ['',Validators.required],
        currencyRate: ['',Validators.required],

        bankName: [''],
        branchName: [''],
        address: [''],
        paymentMode: ['',Validators.required],
        paymentType: [''],
        transactionNo: ['',],
        transactionType: [''],
      }));
    }

  }


  doEcashment(){
    if (validateDynamicFormFields(this.creationForm,'encasement')) {
      return;
    }

    this.loadingText = "Saving record. Please wait.";
    this.spinner.show("main-spiner");

    let creationForm = this.creationForm.value;
    creationForm.encasement.forEach((value, index, self) => {
      let element = creationForm.encasement[index];
      creationForm.encasement[index]["id"]=getObjKeyVal(element,'id',0);
      creationForm.encasement[index]["customers"]=getObjKeyVal(element,'customerId',0);
      creationForm.encasement[index]["currencyAmount"]=getObjKeyVal(element,'currencyAmount',0);
      creationForm.encasement[index]["currencyRate"]=getObjKeyVal(element,'currencyRate',0);
      creationForm.encasement[index]["bankName"]=getObjKeyVal(element,'bankName',"");
      creationForm.encasement[index]["branchName"]=getObjKeyVal(element,'branchName',"");
      creationForm.encasement[index]["address"]=getObjKeyVal(element,'address',"");
      creationForm.encasement[index]["transactionNo"]=getObjKeyVal(element,'transactionNo',"");

      creationForm.encasement[index]["currency"]=getKeyValue(element,'currency','id',0);
      creationForm.encasement[index]["paymentMode"]=getKeyValue(element,'paymentMode','id',0);
      creationForm.encasement[index]["paymentType"]=getKeyValue(element,'paymentType','id',0);
      creationForm.encasement[index]["transactionType"]=getKeyValue(element,'transactionType','id',0);
    });

    let url = "/api/v1/encashment/do/encashment";
    this.httpService.callAuthApi(url,creationForm,ReqMethod.POST)
      .subscribe(data => {
            this.spinner.hide("main-spiner");
            if(data.respCode==Constant.respCode200){
                let payload = data.payload;
                let invoice = payload.invoiceNo;
                this.ngOnInit();
                this.printInvoicePdf(invoice);
                this.toastr.success(data.respDescription);
                //this.router.navigate(['transaction/encashmentlist']);
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


  showBankDetails(rowData,i){
    if(rowData.value.paymentMode.id==2){
      this.viewBankDetails[i] = true;
      let formCtrl = this.encasementT['controls'][i]['controls'];
      formCtrl['paymentType'].setValidators([Validators.required]);
      formCtrl['paymentType'].updateValueAndValidity();
      formCtrl['transactionNo'].setValidators([Validators.required]);
      formCtrl['transactionNo'].updateValueAndValidity();
      formCtrl['bankName'].setValidators([Validators.required]);
      formCtrl['bankName'].updateValueAndValidity();
      formCtrl['branchName'].setValidators([Validators.required]);
      formCtrl['branchName'].updateValueAndValidity();
    }else {
      this.viewBankDetails[i] = false;
      let formCtrl = this.encasementT['controls'][i]['controls'];
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

  addEncasementRow(row) {
    let obj = this.rowData;
    this.encasementT.push(this.formBuilder.group({
        customerId: [getObjKeyVal(obj, 'id', 0),Validators.required],
        customerName: [{value: getObjKeyVal(obj, 'name', ''), disabled: true}],
        currency: ['',Validators.required],
        currencyAmount: ['',Validators.required],
        currencyRate: ['',Validators.required],

        bankName: [''],
        branchName: [''],
        address: [''],
        paymentMode: ['',Validators.required],
        paymentType: [''],
        transactionNo: ['',],
        transactionType: [''],
    }));
  }

  removeEncasementRow(row) {
    if (this.encasementT.length > 1)
      this.encasementT.removeAt(row);
  }

  printInvoicePdf(invoiceNo:any){
    var h = 650; var w = 800; 
    var left = (screen.width/2)-(w/2);
    var top = (screen.height/2)-(h/2);
    let url = environment.backEndUrl+"/api/v1/encashment/get/encashment/pdf?invoiceNo="+invoiceNo;
    return window.open(url, "Pdf Viewer", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
  }

}
