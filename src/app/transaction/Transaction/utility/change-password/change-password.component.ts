import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Constant } from 'src/app/constant/constant';
import { AuthService } from 'src/app/services/auth.service';
import { HttpService } from 'src/app/services/http.service';
import { getObjKeyVal, validateFormFields } from 'src/app/shared/function/function';
import { ReqMethod } from 'src/app/shared/function/method';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  public creationForm: FormGroup;
  public loadingText: string;

  constructor(
    private router: Router,
    public formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    public toastr: ToastrService,
    public httpService:HttpService,
  ) { }

  ngOnInit(): void {
    this.initilizeForm();
  }

  initilizeForm(){
    this.creationForm = this.formBuilder.group({
      oldPassword:['',Validators.required],
      newPassword:['',Validators.required],
    });
  }

  changePassword() {
    if(this.creationForm.invalid) {
      validateFormFields(this.creationForm);
      return;
    }

    this.loadingText = "Reseting password. Please wait...";
    this.spinner.show("main-spiner");

    let creationForm = this.creationForm.value;
    let data = {
      oldPassword:getObjKeyVal(creationForm,"oldPassword",""),
      password:getObjKeyVal(creationForm,"newPassword","")
    }

    let url = "/api/v1/user/update/password/by/oldpassword";
    this.httpService.callAuthApi(url,data,ReqMethod.PUT)
      .subscribe(data => {
            this.spinner.hide("main-spiner");
            if(data.respCode==Constant.respCode200){
                this.toastr.success(data.respDescription);
                localStorage.removeItem("isLogin");
                localStorage.removeItem("loginDetails");
                localStorage.removeItem("userDetails");
                this.router.navigate(['/']);
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


}
