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
import { getDropdownObj, getKeyValue, getObjKeyVal, validateDynamicFormFields } from 'src/app/shared/function/function';
import { ReqMethod } from 'src/app/shared/function/method';

@Component({
  selector: 'app-modify-encashment',
  templateUrl: './modify-encashment.component.html',
  styleUrls: ['./modify-encashment.component.scss']
})
export class ModifyEncashmentComponent implements OnInit {

  public creationForm: FormGroup;
  public currentDate: string;

  public currencyList: any = [];
  public paymentMoodList: any = [];
  public paymentTypeList: any = [];
  public tranTypeList: any = [];
  public rowData = new Object();
  public viewBankDetails = {};

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
    this.dbService.getAll('currency').subscribe((data) => {
        this.rowData = data[0];
        this.initilizeForm();
    });
  }

  get encasementF() { return this.creationForm.controls; }
  get encasementT() { return this.encasementF.encasement as FormArray; }


  initilizeForm() {

    let rowwData = this.rowData;
    this.creationForm = this.formBuilder.group({
      encasement: new FormArray([])
    });


    for (let i = 0; i < 1; i++) {

      if (getObjKeyVal(rowwData['paymentMode'], 'id', 0) == 2) {
        this.viewBankDetails[i] = true;
      }

      let currncyId = getObjKeyVal(rowwData['currency'], 'id', 0);
      let code = getObjKeyVal(rowwData['currency'], 'code', '');
      let country = getObjKeyVal(rowwData['currency'], 'country', 0);
      let currency = { id: currncyId, name: code + " - " + country }

      this.encasementT.push(this.formBuilder.group({
        id: [getObjKeyVal(rowwData, 'id', 0)],
        customerId: [getKeyValue(rowwData, 'customers', 'id', null), Validators.required],
        customerName: [{ value: getKeyValue(rowwData, 'customers', 'name', ''), disabled: true }],

        currency: [currency, Validators.required],
        currencyAmount: [getObjKeyVal(rowwData, 'currencyAmount', 0), Validators.required],
        currencyRate: [getObjKeyVal(rowwData, 'currencyRate', 0), Validators.required],

        bankName: [getObjKeyVal(rowwData, 'bankName', '')],
        branchName: [getObjKeyVal(rowwData, 'branchName', '')],
        address: [getObjKeyVal(rowwData, 'address', '')],
        paymentMode: [getDropdownObj(rowwData['paymentMode'], 'id,paymentModeName', 'id,name'), Validators.required],
        paymentType: [getDropdownObj(rowwData['paymentType'], 'id,paymentTypeName', 'id,name')],
        transactionNo: [getObjKeyVal(rowwData, 'transactionNo', ''),],
        transactionType: [getDropdownObj(rowwData['transactionType'], 'id,tranTypeName', 'id,name')],
      }));
    }

  }


  updateEcashment() {
    if (validateDynamicFormFields(this.creationForm, 'encasement')) {
      return;
    }

    let creationForm = this.creationForm.value;
    creationForm.encasement.forEach((value, index, self) => {
      let element = creationForm.encasement[index];
      creationForm.encasement[index]["id"] = getObjKeyVal(element, 'id', 0);
      creationForm.encasement[index]["customers"] = getObjKeyVal(element, 'customerId', 0);
      creationForm.encasement[index]["currencyAmount"] = getObjKeyVal(element, 'currencyAmount', 0);
      creationForm.encasement[index]["currencyRate"] = getObjKeyVal(element, 'currencyRate', 0);
      creationForm.encasement[index]["bankName"] = getObjKeyVal(element, 'bankName', "");
      creationForm.encasement[index]["branchName"] = getObjKeyVal(element, 'branchName', "");
      creationForm.encasement[index]["address"] = getObjKeyVal(element, 'address', "");
      creationForm.encasement[index]["transactionNo"] = getObjKeyVal(element, 'transactionNo', "");

      creationForm.encasement[index]["currency"] = getKeyValue(element, 'currency', 'id', 0);
      creationForm.encasement[index]["paymentMode"] = getKeyValue(element, 'paymentMode', 'id', 0);
      creationForm.encasement[index]["paymentType"] = getKeyValue(element, 'paymentType', 'id', 0);
      creationForm.encasement[index]["transactionType"] = getKeyValue(element, 'transactionType', 'id', 0);
    });
    
    let url = "/api/v1/encashment/do/encashment";
    this.httpService.callAuthApi(url, creationForm, ReqMethod.POST)
      .subscribe(data => {
        this.spinner.hide("main-spiner");
        if (data.respCode == Constant.respCode200) {
          this.toastr.success(data.respDescription);
        } else {
          this.toastr.error(data.respDescription);
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


  getCurrencyList() {

    let url = "/api/v1/master/get/currency/list";
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        if (data.respCode === Constant.respCode200) {
          let tempList = new Array();
          data.payload.forEach(elm => {
            tempList.push({
              id: elm.id,
              name: elm.code + " - " + elm.country,
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


  showBankDetails(rowData, i) {
    if (rowData.value.paymentMode.id == 2) {
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
    } else {
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

}
