import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject,Observable } from 'rxjs'
import { environment } from 'src/environments/environment';
import { Constant } from '../constant/constant';

@Injectable()
export class MessagingService {

  currentMessage = new BehaviorSubject(null);

  constructor(
    private http:HttpClient,
    private angularFireMessaging: AngularFireMessaging
  ) {
    this.angularFireMessaging.messages.subscribe((_messaging: AngularFireMessaging) => {
      _messaging.onMessage  = _messaging.onMessage.bind(_messaging);
      _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
    })
  }

  requestPermission(empId,type,userNames) {
    this.angularFireMessaging.requestToken.subscribe((currentToken) => {
      if(empId){
        let request :any = {
          createdBy:empId,
          userType:type,
          token:currentToken,
          userName:userNames
        };

        this.saveToken(request)
        .subscribe(data => {
          if(data.respCode==Constant.respCode200){
            console.log("Token saved successfully");
            console.log("Current token : "+currentToken);
          }else{
            console.log("Token not saved");
          }
        });
      }
    },(err) => {
      console.error('Unable to get permission to notify.', err);
    });
  }

  receiveMessage() {
    this.angularFireMessaging.messages.subscribe((payload) => {
      console.log("new message received. ", payload['data']);
      this.currentMessage.next(payload);
    });
  }

  saveToken(request):Observable<any>{
    return this.http.post<any>(environment.backEndUrl+'/api/transaction/notification/saveNotificationToken',request);
  }


}
