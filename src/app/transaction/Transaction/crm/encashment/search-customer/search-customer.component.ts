import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Constant } from 'src/app/constant/constant';
import { HttpService } from 'src/app/services/http.service';
import { SharedService } from 'src/app/services/shared.service';
import { formateDate, getDropdownArray, getDropdownObj, getKeyValue, getObjKeyVal, validateFormFields } from 'src/app/shared/function/function';
import { ReqMethod } from 'src/app/shared/function/method';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-search-customer',
  templateUrl: './search-customer.component.html',
  styleUrls: ['./search-customer.component.scss']
})
export class SearchCustomerComponent implements OnInit {

  public searchForm: FormGroup;
  public createForm: FormGroup;

  public loadingText: string;
  public isEncasement = false;
  public viewDocument = false;
  public showCustomerPage = false;
  public customerTypeList = [];

  public countryList = [];
  public stateList = [];
  public cityList = [];
  public docTypeList = [];
  public addressTypeList = [];
  public profileTypeList = [];
  public docUrl = environment.documentUrl;

  constructor(
    private router: Router,
    public formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    public toastr: ToastrService,
    public httpService: HttpService,
    private shared: SharedService,
  ) {
    this.getAllDocTypeList();
    this.getCustomerTypeList();
    this.getProfileTypeList();
    this.getAddressTypeList();
    this.getAllCountryList();
  }

  ngOnInit(): void {
    this.initilizeForm();
  }

  initilizeForm() {
    this.searchForm = this.formBuilder.group({
      mobileNo: ['8866557758', Validators.required]
    });

    this.createForm = this.formBuilder.group({
      id: [''],
      customerName: ['', Validators.required],
      mobileNo: ['', Validators.required],
      email: ['',],
      customerType: ['', Validators.required],
      docType: ['', Validators.required],
      documentNo: ['', Validators.required],
      profileType: ['', Validators.required],
      fileName: [''],
      docBase64: [''],
      arrivalDate: [''],
      gender: ['Male'],

      addressType: ['', Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      pinCode: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  searchCustomer() {

    let searchForm = this.searchForm.value;
    let mobileNo = getObjKeyVal(searchForm, "mobileNo", "");

    if (this.searchForm.invalid) {
      validateFormFields(this.searchForm);
      return;
    } else if (mobileNo.length < 10) {
      this.createForm.reset();
      return false;
    }

    this.loadingText = "Searching . Please wait...";
    this.spinner.show("main-spiner");

    let url = "/api/v1/customer/get/customer/list/by/mobile/no?mobileNo=" + mobileNo;
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {

        this.spinner.hide("main-spiner");
        if (data.respCode == Constant.respCode200) {
          this.toastr.success(data.respDescription);
          this.isEncasement = true;
          this.showCustomerPage = true;

          let user = data.payload;
          this.shared.setData(user,"customerData");

          this.createForm['controls']["id"].setValue(user.id);
          this.createForm['controls']["customerName"].setValue(user.name);
          this.createForm['controls']["mobileNo"].setValue(user.mobile);
          this.createForm['controls']["email"].setValue(user.email);
          this.createForm['controls']["email"].setValue(user.email);
          this.createForm['controls']["documentNo"].setValue(user.documentNo);
          this.createForm['controls']["arrivalDate"].setValue(user.arrivalDate);
          this.createForm['controls']["gender"].setValue(user.geneder);
          this.createForm['controls']["fileName"].setValue(user.docAttachement);

          let customerType = getDropdownObj(user['customerType'], 'id,customerTypeName', 'id,name');
          this.createForm['controls']["customerType"].setValue(customerType);

          let docType = getDropdownObj(user['docType'], 'id,docName', 'id,name');
          this.createForm['controls']["docType"].setValue(docType);

          let profileType = getDropdownObj(user['profileType'], 'id,profileTypeName', 'id,name');
          this.createForm['controls']["profileType"].setValue(profileType);

          let addressType = getDropdownObj(user['address']['addressType'], 'id,addressTypeName', 'id,name');
          this.createForm['controls']["addressType"].setValue(addressType);

          let country = getDropdownObj(user['address']['country'], 'id,countryName', 'id,name');
          this.createForm['controls']["country"].setValue(country);

          let state = getDropdownObj(user['address']['state'], 'id,stateName', 'id,name');
          this.createForm['controls']["state"].setValue(state);

          let city = getDropdownObj(user['address']['city'], 'id,cityName', 'id,name');
          this.createForm['controls']["city"].setValue(city);

          this.createForm['controls']["address"].setValue(user.address.address);
          this.createForm['controls']["pinCode"].setValue(user.address.pinCode);

          this.stateList = getDropdownArray(user['address']['country']['states'], 'id,stateName', 'id,name');
          this.cityList = getDropdownArray(user['address']['state']['citys'], 'id,cityName', 'id,name');
        } else {
          this.toastr.error(data.respDescription);
          this.isEncasement = false;
          this.showCustomerPage = true;
          this.createForm.reset();

          let searchForm = this.searchForm.value;
          this.createForm['controls']["mobileNo"].setValue(searchForm.mobileNo);
        }
      }, (err: HttpErrorResponse) => {
        this.isEncasement = false;
        this.spinner.hide("main-spiner");
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });

  }

  saveCustomer() {

    if (this.createForm.invalid) {
      validateFormFields(this.createForm);
      return;
    }


    this.loadingText = "Saving data. Please wait...";
    this.spinner.show("main-spiner");

    let creationForm = this.createForm.value;

    let data = {
      name: creationForm.customerName,
      mobileNo: creationForm.mobileNo,
      email: creationForm.email,
      documentNo: creationForm.documentNo,
      docBase64: creationForm.docBase64,
      geneder: creationForm.gender,

      arrivalDate: formateDate(creationForm.arrivalDate),
      customerType: getKeyValue(creationForm, 'customerType', 'id', 0),
      docType: getKeyValue(creationForm, 'docType', 'id', 0),
      profileType: getKeyValue(creationForm, 'profileType', 'id', 0),

      addressId: getKeyValue(creationForm, 'addressId', 'id', 0),//

      addressType: getKeyValue(creationForm, 'addressType', 'id', "0"),
      countryId: getKeyValue(creationForm, 'country', 'id', "0"),
      stateId: getKeyValue(creationForm, 'state', 'id', "0"),
      cityId: getKeyValue(creationForm, 'city', 'id', "0"),
      address: getObjKeyVal(creationForm, "address", ""),
      pinCode: getObjKeyVal(creationForm, "pinCode", ""),
    }


    let url = "/api/v1/customer/add/new/customer";
    this.httpService.callAuthApi(url, data, ReqMethod.POST)
      .subscribe(data => {
        this.spinner.hide("main-spiner");
        if (data.respCode == Constant.respCode200) {
          this.toastr.success(data.respDescription);
        } else {
          this.toastr.error(data.respDescription);
        }
        this.searchCustomer();
      }, (err: HttpErrorResponse) => {
        this.spinner.hide("main-spiner");
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });
  }


  onDocPhotoSelect(event) {
    for (let file of event.files) {
      if (file) {
        let myReader: FileReader = new FileReader();
        myReader.onloadend = (e) => {
          this.createForm.controls["docBase64"].setValue(myReader.result)
        };
        myReader.readAsDataURL(file);
      }
    }
  }

  getAddressTypeList() {

    let url = "/api/v1/master/get/addresstype/list";
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        if (data.respCode === Constant.respCode200) {
          let tempList = new Array();
          data.payload.forEach(elm => {
            tempList.push({
              id: elm.id,
              name: elm.addressTypeName
            });
          });
          this.addressTypeList = tempList;
        } else {
          this.addressTypeList = [];
        }
      }, (err: HttpErrorResponse) => {
        this.addressTypeList = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });
  }

  getAllCountryList() {

    let url = "/api/v1/master/get/country/list";
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        if (data.respCode === Constant.respCode200) {
          let tempList = new Array();
          data.payload.forEach(elm => {
            tempList.push({
              id: elm.id,
              name: elm.countryName
            });
          });
          this.countryList = tempList;
        } else {
          this.countryList = [];
        }
      }, (err: HttpErrorResponse) => {
        this.countryList = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });

  }

  getAllStateList(event) {

    let countryId = (event.value) ? event.value.id : 0;
    let url = "/api/v1/master/get/state/list?id=" + countryId;
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        if (data.respCode === Constant.respCode200) {
          let tempList = new Array();
          data.payload.forEach(elm => {
            tempList.push({
              id: elm.id,
              name: elm.stateName
            });
          });
          this.stateList = tempList;
        } else {
          this.stateList = [];
          this.cityList = [];
        }
      }, (err: HttpErrorResponse) => {
        this.stateList = [];
        this.cityList = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });
  }

  getAllCityList(event) {
    let stateId = (event.value) ? event.value.id : 0;

    let url = "/api/v1/master/get/city/list?id=" + stateId;
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        if (data.respCode === Constant.respCode200) {
          let tempList = new Array();
          data.payload.forEach(elm => {
            tempList.push({
              id: elm.id,
              name: elm.cityName
            });
          });
          this.cityList = tempList;
        } else {
          this.cityList = [];
        }
      }, (err: HttpErrorResponse) => {
        this.cityList = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });
  }

  getAllDocTypeList() {

    let url = "/api/v1/master/get/doctype/list";
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        if (data.respCode === Constant.respCode200) {
          let tempList = new Array();
          data.payload.forEach(elm => {
            tempList.push({
              id: elm.id,
              name: elm.docName
            });
          });
          this.docTypeList = tempList;
        } else {
          this.docTypeList = [];
        }
      }, (err: HttpErrorResponse) => {
        this.docTypeList = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });

  }

  getCustomerTypeList() {

    let url = "/api/v1/master/get/customer/type/list";
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        if (data.respCode === Constant.respCode200) {
          let tempList = new Array();
          data.payload.forEach(elm => {
            tempList.push({
              id: elm.id,
              name: elm.customerTypeName
            });
          });
          this.customerTypeList = tempList;
        } else {
          this.customerTypeList = [];
        }
      }, (err: HttpErrorResponse) => {
        this.customerTypeList = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });

  }

  getProfileTypeList() {

    let url = "/api/v1/master/get/profile/type/list";
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        if (data.respCode === Constant.respCode200) {
          let tempList = new Array();
          data.payload.forEach(elm => {
            tempList.push({
              id: elm.id,
              name: elm.profileTypeName
            });
          });
          this.profileTypeList = tempList;
        } else {
          this.profileTypeList = [];
        }
      }, (err: HttpErrorResponse) => {
        this.profileTypeList = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });

  }

}
