import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DialogService } from 'primeng/dynamicdialog';
import { Constant } from 'src/app/constant/constant';
import { AuthService } from 'src/app/services/auth.service';
import { HttpService } from 'src/app/services/http.service';
import { getDropdownArray, getDropdownObj, getKeyValue, getObjKeyVal, validateDynamicFormFields, validateFormFields } from 'src/app/shared/function/function';
import { ReqMethod } from 'src/app/shared/function/method';
import { environment } from 'src/environments/environment';
import { CityCreationComponent } from '../../city/city-creation/city-creation.component';

@Component({
  selector: 'app-employee-modification',
  templateUrl: './employee-modification.component.html',
  styleUrls: ['./employee-modification.component.scss'],
  providers: [DialogService]
})
export class EmployeeModificationComponent implements OnInit {

  @ViewChild('photos') photos: any;

  public creationForm: FormGroup;
  public loadingText: string;

  public roleList: any = [];
  public statusList: any = [];
  public addressTypeList: any = [];
  public docTypeList: any = [];
  public parentList: any = [];
  
  public countryList: any = [];
  public stateList: any = {};
  public cityList: any = {};

  public permissionList: any = [];
  public uploadedFiles: any = [];
  public activeIndex = 0;
  public rowData = {};
  public displayDoc = {};
  public viewUserPhotos = false;
  public userData:any = new Object();
  public docUrl = environment.documentUrl;

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    public toastr: ToastrService,
    public httpService: HttpService,
    private router: Router,
    private authService: AuthService,
    private dbService: NgxIndexedDBService,
    public dialogService: DialogService
  ) {
    this.getUserData();
    this.getAllRoleList();
    this.getAllStatusList();
    this.getAddressTypeList();
    this.getAllCountryList();
    this.getAllDocTypeList();
    this.getAllUserMasterList();
    this.getPermissionNameList();
  }

  ngOnInit() {
    this.initilizeForm();
    this.dbService.getAll('users').subscribe((data) => {
        this.rowData = data[0];
        this.initilizeForm();
    });
  }

  get docF() { return this.creationForm.controls; }
  get docT() { return this.docF.userDoc as FormArray; }

  get addF() { return this.creationForm.controls; }
  get addT() { return this.docF.address as FormArray; }

  initilizeForm() {
    let obj = this.rowData;

    this.creationForm = this.formBuilder.group({
      name: [getObjKeyVal(obj, 'name', ''), Validators.required],
      mobileNo: [getObjKeyVal(obj, 'mobile', ''), Validators.required],
      email: [getObjKeyVal(obj, 'email', '')],
      gstNumber: [getObjKeyVal(obj, 'gstNumber', ''), Validators.required],
      firmName: [getObjKeyVal(obj, 'firmName', '')],
      roleId: [getDropdownObj(obj['roleId'], 'id,roleName', 'id,name'), Validators.required],
      status: [getDropdownObj(obj['active'], 'id,statusName', 'id,name'), Validators.required],
      userPhoto: [getObjKeyVal(obj, 'userPhoto', '')],
      permission: [getObjKeyVal(obj, 'permission', '')],
      createdBy: [1],
      
      userDoc: new FormArray([]),
      address: new FormArray([])
    });

    let userDocument = getObjKeyVal(obj, 'userDoc', [])
    for (let i = 0; i < userDocument.length; i++) {
      let elm = userDocument[i];
      this.displayDoc[i] = false;
      this.docT.push(this.formBuilder.group({
        id: [getObjKeyVal(elm, 'id', 0)],
        status: [getObjKeyVal(elm, 'status', 0)],
        docType: [getDropdownObj(elm['docType'], 'id,docName', 'id,name'), Validators.required],
        docNumber: [getObjKeyVal(elm, 'docNumber', ''), Validators.required],
        fileName: [getObjKeyVal(elm, 'fileName', '')],
        docBase64: [''],
      }));
    }

    let address = getObjKeyVal(obj, 'address', [])
    for (let i = 0; i < address.length; i++) {
      let elm = address[i];
      this.stateList[i] = getDropdownArray(elm['country']['states'], 'id,stateName', 'id,name');
      this.cityList[i] = getDropdownArray(elm['state']['citys'], 'id,cityName', 'id,name');

      this.addT.push(this.formBuilder.group({
        id: [getObjKeyVal(elm, 'id', 0)],
        status: [getObjKeyVal(elm, 'status', 0)],
        addressType: [getDropdownObj(elm['addressType'], 'id,addressTypeName', 'id,name'), Validators.required],
        country: [getDropdownObj(elm['country'], 'id,countryName', 'id,name'), Validators.required],
        state: [getDropdownObj(elm['state'], 'id,stateName', 'id,name'), Validators.required],
        city: [getDropdownObj(elm['city'], 'id,cityName', 'id,name'), Validators.required],
        address: [getObjKeyVal(elm, 'address', ''), Validators.required],
        pinCode: [getObjKeyVal(elm, 'pinCode', ''), Validators.required],
      }));
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
        this.roleList = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });
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

  getAllStatusList() {

    let url = "/api/v1/master/get/status/list";
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        if (data.respCode === Constant.respCode200) {
          let tempList = new Array();
          data.payload.forEach(elm => {
            tempList.push({
              id: elm.id,
              name: elm.statusName
            });
          });
          this.statusList = tempList;
        } else {
          this.statusList = [];
        }
      }, (err: HttpErrorResponse) => {
        this.statusList = [];
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
        this.statusList = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });

  }

  getAllStateList(event, row) {
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
          this.stateList[row] = tempList;
        } else {
          this.stateList[row] = [];
          this.cityList[row] = [];
        }
      }, (err: HttpErrorResponse) => {
        this.stateList[row] = [];
        this.cityList[row] = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });





  }

  getAllCityList(event, row) {
    let stateId = (event.value) ? event.value.id : event;

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
          this.cityList[row] = tempList;
        } else {
          this.cityList[row] = [];
        }
      }, (err: HttpErrorResponse) => {
        this.cityList[row] = [];
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

  getPermissionNameList() {

    let url = "/api/v1/master/get/permission/list";
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        if (data.respCode === Constant.respCode200) {
          this.permissionList = data.payload;
        } else {
          this.permissionList = [];
        }
      }, (err: HttpErrorResponse) => {
        this.permissionList = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });

  }

  getAllUserMasterList() {

    let url = "/api/v1/user/get/user/master/list";
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        if (data.respCode === Constant.respCode200) {
          let tempList = new Array();
          data.payload.forEach(elm => {
            tempList.push({
              id: elm.id,
              name: elm.name +" ("+elm.userName+")"
            });

            /* Set parent if super admin and admin */
            this.dbService.getAll('users').subscribe((data) => {
              if(getObjKeyVal(data[0], 'createdBy', 0)==elm.id){
                let user = { id: elm.id, name: elm.name +" ("+elm.userName+")" }
                this.creationForm.controls['createdBy'].setValue(user);
              }
            });
          });
          this.parentList = tempList;
        } else {
          this.parentList = [];
        }
      }, (err: HttpErrorResponse) => {
        this.parentList = [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });

  }

  getUserData() {
    this.userData = this.authService.getUserDetails();
    this.userData = (this.userData) ? this.userData :
    { userPhoto: "", name: "", mobile: "" ,email:""};
  }

  addDocRow(row) {
    this.docT.push(this.formBuilder.group({
      id: [0],
      status: [0],
      docType: ['', Validators.required],
      docNumber: ['', Validators.required],
      fileName: ['', Validators.required],
      docBase64: ['', Validators.required],
    }));
  }

  removeDocRow(row, rowData) {

    let documentId = getObjKeyVal(rowData, 'id', 0);
    if (this.docT.length > 1 && documentId != 0) {
      this.loadingText = "Deleting data. Please wait...";
      this.spinner.show("main-spiner");

      let data = { docId: documentId }
      let url = "/api/v1/user/delete/user/doc";
      this.httpService.callAuthApi(url, data, ReqMethod.POST)
        .subscribe(data => {
          this.spinner.hide("main-spiner");
          if (data.respCode == Constant.respCode200) {
            this.toastr.success(data.respDescription);
            this.docT.removeAt(row);
            this.getUserDetailsById(this.rowData['id']);
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
    } else if (this.docT.length > 1) {
      this.docT.removeAt(row);
    }
  }

  addAddressRow(row) {
    this.addT.push(this.formBuilder.group({
      id: [0],
      status: [0],
      addressType: ['', Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
      pinCode: ['', Validators.required],
    }));
  }

  removeAddressRow(row) {
    if (this.addT.length > 1)
      this.addT.removeAt(row);
  }

  onPhotoSelect(event, type) {
    for (let file of event.files) {
      if (file) {
        let myReader: FileReader = new FileReader();
        myReader.onloadend = (e) => {
          let data = { fileName: file.name, base64: myReader.result };
          this.creationForm.controls[type].setValue(data)
        };
        myReader.readAsDataURL(file);
      }
    }
  }

  onDocumentSelect(event, i) {
    let file = event.files[0]
    if (file) {
      let myReader: FileReader = new FileReader();
      myReader.onloadend = (e) => {
        this.docT.controls[i]['controls']["fileName"].setValue(file.name);
        this.docT.controls[i]['controls']["docBase64"].setValue(myReader.result);
      };
      myReader.readAsDataURL(file);
    }
  }

  updateDocStatus(rowData, i, statusId) {

    this.loadingText = "Updating data. Please wait...";
    this.spinner.show("main-spiner");

    let data = {
      status: statusId,
      docId: getObjKeyVal(rowData, 'id', 0)
    }

    let url = "/api/v1/user/update/user/doc/status";
    this.httpService.callAuthApi(url, data, ReqMethod.PUT)
      .subscribe(data => {
        this.spinner.hide("main-spiner");
        if (data.respCode == Constant.respCode200) {
          this.toastr.success(data.respDescription);
          this.getUserDetailsById(this.rowData['id']);
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

  getUserDetailsById(id) {

    let url = "/api/v1/user/get/user/details/by/id?id=" + id;
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        if (data.respCode == Constant.respCode200) {
         // this.sharedService.setData(data.payload, "empData");
          this.ngOnInit();
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

  updateEmployee() {

    if (this.creationForm.controls['roleId'].invalid) {
      validateFormFields(this.creationForm);
      this.activeIndex = 0;
      return;
    }

    if (validateDynamicFormFields(this.creationForm, 'address')) {
      this.activeIndex = 1;
      return;
    }

    if (validateDynamicFormFields(this.creationForm, 'userDoc')) {
      this.activeIndex = 2;
      return;
    }

    this.loadingText = "Saving data. Please wait...";
    this.spinner.show("main-spiner");

    let creationForm = this.creationForm.value;

    creationForm.address.forEach((value, index, self) => {
      let element = creationForm.address[index];
      creationForm.address[index]["addressType"] = getKeyValue(element, 'addressType', 'id', "0");
      creationForm.address[index]["country"] = getKeyValue(element, 'country', 'id', "0");
      creationForm.address[index]["state"] = getKeyValue(element, 'state', 'id', "0");
      creationForm.address[index]["city"] = getKeyValue(element, 'city', 'id', "0");
    });

    creationForm.userDoc.forEach((value, index, self) => {
      let element = creationForm.userDoc[index];
      creationForm.userDoc[index]["docType"] = getKeyValue(element, 'docType', 'id', "0");
    });


    let data = {
      services: 1,
      name: creationForm.name,
      mobileNo: creationForm.mobileNo,
      email: creationForm.email,
      gstNumber: creationForm.gstNumber,
      firmName: creationForm.firmName,
      address: creationForm.address,
      userDoc: creationForm.userDoc,
      userId: getObjKeyVal(this.rowData, "id", 0),
      roleId: getKeyValue(creationForm, 'roleId', 'id', 0),
      status: getKeyValue(creationForm, 'status', 'id', 0),
      createdBy : getKeyValue(creationForm,'createdBy','id',0),
      permission: getKeyValue(creationForm, 'permission', 'id', 0),
      userPhoto: getKeyValue(creationForm, 'userPhoto', 'base64', ""),
    }

    let url = "/api/v1/user/update/exists/user";
    this.httpService.callAuthApi(url, data, ReqMethod.PUT)
      .subscribe(data => {
        this.spinner.hide("main-spiner");
        if (data.respCode == Constant.respCode200) {
          this.toastr.success(data.respDescription);
          //this.getUserDetailsById(this.rowData['id']);
          this.router.navigate(['transaction/employeelist']);
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

  addNewCity(row){
    let createForm = this.creationForm.value;
    const address = createForm.address[row];
    
    let data = {
      stateId:getObjKeyVal(address['state'],'id',0),
      stateName:getObjKeyVal(address['state'],'name','')
    }

    const ref = this.dialogService.open(CityCreationComponent, {
      data: data,
      header: '',
      width: '50%'
    });

    ref.onClose.subscribe((data: any) => {
      if(data){
        this.getAllCityList(getObjKeyVal(data,'stateId',0),row);
      }
    });
  }

}
