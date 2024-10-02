import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, lastValueFrom, BehaviorSubject } from 'rxjs';
import { Iactivity } from '../interfaces/iactivity';


@Injectable({
  providedIn: 'root'
}) 
export class PagosService {
  httpClient = inject(HttpClient);
  urlBase = 'http://localhost:3030/api/activity';
  urlUserHasAct = 'http://localhost:3030/api/userHasActivity';
  
 

  getAll(): Promise<Iactivity[]> { 
    return firstValueFrom(this.httpClient.get<Iactivity[]>(this.urlBase));
  }

  getById(id: number) :Promise<Iactivity> {
    return firstValueFrom(this.httpClient.get<Iactivity>(`${this.urlBase}/${id}`));
  }

  update(fromValue:Iactivity){
    return lastValueFrom(this.httpClient.patch<Iactivity>(`${this.urlBase}/${fromValue.id}`,fromValue));
  }



  delete(id:number){
    return lastValueFrom(this.httpClient.delete<Iactivity>(`${this.urlBase}/${id}`));
  }

  insert(fromValue:Iactivity){
    return lastValueFrom(this.httpClient.post<Iactivity>(`${this.urlBase}/register`, fromValue));
  }

  insertUser(fromValue:any){
    return lastValueFrom(this.httpClient.post<any>(`${this.urlUserHasAct}/registerUser`, fromValue));
  }

  deleteUserAct(fromValue:any){
    const params = new HttpParams()
    .set('idUser', fromValue.idUser)
    .set('idActivitie', fromValue.idActivitie)
    .set('seleccionado', fromValue.seleccionado);
    return lastValueFrom(this.httpClient.delete<any>(`${this.urlUserHasAct}/deleteUser`,{params}));
  }

  getByGroup(idGroup: number): Promise<Iactivity[]> {
    return firstValueFrom(this.httpClient.get<Iactivity[]>(`${this.urlBase}/${idGroup}`));
  }


}
