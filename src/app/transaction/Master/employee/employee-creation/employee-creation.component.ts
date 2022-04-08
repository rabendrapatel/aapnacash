import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DialogService } from 'primeng/dynamicdialog';
import { Constant } from 'src/app/constant/constant';
import { AuthService } from 'src/app/services/auth.service';
import { HttpService } from 'src/app/services/http.service';
import { getKeyValue, getObjKeyVal, validateDynamicFormFields, validateFormFields } from 'src/app/shared/function/function';
import { ReqMethod } from 'src/app/shared/function/method';
import { CityCreationComponent } from '../../city/city-creation/city-creation.component';

@Component({
  selector: 'app-employee-creation',
  templateUrl: './employee-creation.component.html',
  styleUrls: ['./employee-creation.component.scss'],
  providers: [DialogService]
})
export class EmployeeCreationComponent implements OnInit {

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

  public permissionList: any=[];
  public uploadedFiles: any = [];
  public activeIndex = 0;
  public userData:any = new Object();

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    public toastr: ToastrService,
    public httpService: HttpService,
    private router: Router,
    private authService: AuthService,
    public dialogService: DialogService
  ) { }

  ngOnInit() {
    this.getUserData();
    this.initilizeForm();
    this.getAllRoleList();
    this.getAllStatusList();
    this.getAddressTypeList();
    this.getAllCountryList();
    this.getAllDocTypeList();
    this.getAllUserMasterList();
    this.getPermissionNameList();
    this.getAllStateList(101,0);
  }

  get docF() { return this.creationForm.controls; }
  get docT() { return this.docF.userDoc as FormArray; }

  get addF() { return this.creationForm.controls; }
  get addT() { return this.docF.address as FormArray; }

  initilizeForm() {
    this.creationForm = this.formBuilder.group({
      name: ['', Validators.required],
      mobileNo: ['', Validators.required],
      email: [''],
      gstNumber: ['', Validators.required],
      firmName: [''],
      roleId: ['', Validators.required],
      status: [{ id: 1, name: 'ACTIVE' }, Validators.required],
      userPhoto: [''],
      permission: [''],
      createdBy: [''],

      userDoc: new FormArray([]),
      address: new FormArray([])
    });

    for (let i = 0; i < 1; i++) {
      this.docT.push(this.formBuilder.group({
        docType: ['',Validators.required],
        docNumber: ['',Validators.required],
        fileName: ['',Validators.required],
        docBase64: ['',Validators.required],
      }));
    }

    for (let i = 0; i < 1; i++) {
      this.addT.push(this.formBuilder.group({
        addressType: ['',Validators.required],
        country: [{id: 101, name: 'India'},Validators.required],
        state: ['',Validators.required],
        city: ['',Validators.required],
        address: ['',Validators.required],
        pinCode: ['',Validators.required],
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

  getAllStateList(event,row){


    let countryId = (event.value) ? event.value.id : event;

    let url = "/api/v1/master/get/state/list?id="+countryId;
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
          this.stateList[row]= tempList;
        } else {
          this.stateList[row]= [];
          this.cityList[row]= [];
        }
      }, (err: HttpErrorResponse) => {
        this.stateList[row]= [];
        this.cityList[row]= [];
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });





  }

  getAllCityList(event,row){
    let stateId = (event.value) ? event.value.id : event;

    let url = "/api/v1/master/get/city/list?id="+stateId;
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
          this.cityList[row]= tempList;
        } else {
          this.cityList[row]= [];
        }
      }, (err: HttpErrorResponse) => {
        this.cityList[row]= [];
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
      docType: ['',Validators.required],
      docNumber: ['',Validators.required],
      fileName: ['',Validators.required],
      docBase64: ['',Validators.required],
    }));
  }

  removeDocRow(row) {
    if (this.docT.length > 1)
      this.docT.removeAt(row);
  }

  addAddressRow(row) {
    this.addT.push(this.formBuilder.group({
      addressType: ['',Validators.required],
      country: ['',Validators.required],
      state: ['',Validators.required],
      city: ['',Validators.required],
      address: ['',Validators.required],
      pinCode: ['',Validators.required],
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
    let file =  event.files[0]
    if (file) {
      let myReader: FileReader = new FileReader();
      myReader.onloadend = (e) => {
        this.docT.controls[i]['controls']["fileName"].setValue(file.name);
        this.docT.controls[i]['controls']["docBase64"].setValue(myReader.result);
      };
      myReader.readAsDataURL(file);
    }
  }

  saveEmployee() {

    if (this.creationForm.controls['roleId'].invalid) {
      validateFormFields(this.creationForm);
      this.activeIndex = 0;
      return;
    }

    if (validateDynamicFormFields(this.creationForm,'address')) {
      this.activeIndex = 1;
      return;
    }

    if (validateDynamicFormFields(this.creationForm,'userDoc')) {
      this.activeIndex = 2;
      return;
    }

    this.loadingText = "Saving data. Please wait...";
    this.spinner.show("main-spiner");

    let creationForm = this.creationForm.value;

    creationForm.address.forEach((value, index, self) => {
      let element = creationForm.address[index];
      creationForm.address[index]["addressType"]=getKeyValue(element,'addressType','id',"0");
      creationForm.address[index]["country"]=getKeyValue(element,'country','id',"0");
      creationForm.address[index]["state"]=getKeyValue(element,'state','id',"0");
      creationForm.address[index]["city"]=getKeyValue(element,'city','id',"0");
    });

    creationForm.userDoc.forEach((value, index, self) => {
      let element = creationForm.userDoc[index];
      creationForm.userDoc[index]["docType"]=getKeyValue(element,'docType','id',"0");
    });

    let data = {
      services:1,
      name: creationForm.name,
      mobileNo: creationForm.mobileNo,
      email: creationForm.email,
      gstNumber: creationForm.gstNumber,
      firmName: creationForm.firmName,
      address : creationForm.address,
      userDoc : creationForm.userDoc,
      createdBy : getKeyValue(creationForm,'createdBy','id',0),
      roleId: getKeyValue(creationForm,'roleId','id',0),
      status: getKeyValue(creationForm,'status','id',0),
      permission:getKeyValue(creationForm,'permission','id',0),
      userPhoto: getKeyValue(creationForm,'userPhoto','base64',""),
    }

    let url = "/api/v1/user/add/new/user";
    this.httpService.callAuthApi(url,data,ReqMethod.POST)
      .subscribe(data => {
            this.spinner.hide("main-spiner");
            if(data.respCode==Constant.respCode200){
                this.toastr.success(data.respDescription);
                this.router.navigate(['transaction/employeelist']);
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
