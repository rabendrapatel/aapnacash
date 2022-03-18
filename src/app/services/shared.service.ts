import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {


  constructor(
  ) { }

  getData(key) {
    let data = sessionStorage.getItem(key)
    if(data){
      return JSON.parse(data);
    }
    return new Object();
  }

  setData(rowData,key) {
    sessionStorage.setItem(key, JSON.stringify(rowData));
  }

  removeData(key){
    sessionStorage.removeItem(key);
  }

}
