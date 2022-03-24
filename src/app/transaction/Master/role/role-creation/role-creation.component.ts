import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Constant } from 'src/app/constant/constant';
import { AuthService } from 'src/app/services/auth.service';
import { HttpService } from 'src/app/services/http.service';
import { getKeyValue, validateFormFields } from 'src/app/shared/function/function';
import { ReqMethod } from 'src/app/shared/function/method';

@Component({
  selector: 'app-role-creation',
  templateUrl: './role-creation.component.html',
  styleUrls: ['./role-creation.component.scss']
})
export class RoleCreationComponent implements OnInit {

  public creationForm: FormGroup;
  public permissionList: any = [];
  public roleList: any = [];

  public loadingText: string;
  public selectedPermission = [];
  public assignPermission = [];
  public isNewPermission = 2;
  public userDetails = new Object();

  constructor(
    public formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    public toastr: ToastrService,
    public httpService: HttpService,
    public authService: AuthService,
  ) { 
    this.userDetails = this.authService.getUserDetails();
    this.assignPermission = this.authService.getPermission();
  }

  ngOnInit(): void {
    this.initilizeForm();
    this.getMenuList();
    this.getPermissionNameList();
  }

  initilizeForm() {
    this.creationForm = this.formBuilder.group({
      roleId: [''],
      roleName: ['', Validators.required],
      status: [1],
      roleType: [2]
    });
  }

  getMenuList() {
    this.loadingText = 'Loading permission. Please wait...';
    this.spinner.show('main-spiner');
    
    let url = "/api/v1/menu/get/menu/list";
    this.httpService.callApi(url, {}, ReqMethod.GET)
      .subscribe(data => {

        this.spinner.hide('main-spiner');
        if (data.respCode === Constant.respCode200) {
          this.permissionList = data.payload;
        } else {
          this.permissionList = [];
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.hide('main-spiner');
        this.permissionList = [];
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
          this.roleList = data.payload;
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

  setAssignPermission(event) {
    let permission = (event.value) ?
      event.value.permission : "";

    let roleName = (event.value) ?
      event.value.roleName : "";

    let assignPermission = permission.split(',');
    this.selectedPermission =assignPermission;
    this.creationForm.controls["roleName"].setValue(roleName)
  }

  checkedParent(parentPermission, event) {
    if (event.checked) {
      this.selectedPermission.push(parentPermission);
    } else {
      this.selectedPermission.splice(this.selectedPermission.findIndex(a => a === parentPermission), 1);
    }
  }

  checkedParent1(parentPermission, parentPermission1, event) {
    if (event.checked) {
      this.selectedPermission.push(parentPermission);
      this.selectedPermission.push(parentPermission1);
    } else {
      this.selectedPermission.splice(this.selectedPermission.findIndex(a => a === parentPermission), 1);
      this.selectedPermission.splice(this.selectedPermission.findIndex(a => a === parentPermission1), 1);
    }
  }

  savePermissionMaster() {
    if (this.creationForm.invalid) {
      validateFormFields(this.creationForm);
      return;
    }

    this.loadingText = "Saving data. Please wait...";
    this.spinner.show("main-spiner");

    let creationForm = this.creationForm.value;
    let data = {
      roleId: getKeyValue(creationForm,'roleId','id',"0"),
      name: creationForm.roleName,
      permission: this.selectedPermission.join(","),
      status: creationForm.status
    }

    let url = "/api/v1/menu/save/new/permission";
    this.httpService.callAuthApi(url,data,ReqMethod.POST)
      .subscribe(data => {
            this.spinner.hide("main-spiner");
            if(data.respCode==Constant.respCode200){
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

  updatePermissionMaster() {

    this.loadingText = "Updating data. Please wait...";
    this.spinner.show("main-spiner");

    let creationForm = this.creationForm.value;
    let data = {
      roleId: getKeyValue(creationForm,'roleId','id',"0"),
      name: creationForm.roleName,
      permission: this.selectedPermission.join(","),
      status: creationForm.status
    }

    let url = "/api/v1/menu/save/new/permission";
    this.httpService.callAuthApi(url,data,ReqMethod.POST)
      .subscribe(data => {
            this.spinner.hide("main-spiner");
            if(data.respCode==Constant.respCode200){
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


  checkIfPermissionIsAssign(permission){
      /** If Super admin or admin then show all permission enabled */
      if(this.userDetails['roleId']==1 || this.userDetails['roleId']==2){
          return true;
      }
      /** If Permission assigned to user then show permission */
      else if(this.assignPermission.includes(permission) ){
        return true;
      }
      return false;
  }

}
