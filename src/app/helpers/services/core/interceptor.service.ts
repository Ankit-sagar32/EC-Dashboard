import { Injectable, Injector, ErrorHandler } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, finalize, tap, map } from 'rxjs/operators';
import { EmitterService } from '../../../helpers/services/core/emiter.service';
import { UtilityService } from './utility.service';
import { NotificationService } from '../../../helpers/services/core/notification.service';
@Injectable({
  providedIn: 'root'
})
/**
 * @author Shrinath Poojary
 */
export class DataService {
  constructor(private http: HttpClient, private emitterService: EmitterService) { }

  /**
   * @param  {any} url
   * head call
   */
  head(url: any) {
    this.requestCall();
    return this.http.head(url, { observe: 'response' }).pipe(
      catchError((error) => {
        return throwError(error);
      }),
      finalize(() => this.responseCall()));
  }

  /**
   * @param  {any} url
   * get call
   */
  get(url: any) {
    this.requestCall();
    return this.http.get(url).pipe(
      catchError((error) => {
        return throwError(error);
      }),
      finalize(() => this.responseCall()));
  }

  /**
   * @param  {any} url
   * @param  {any} req
   * post call
   */
  post(url: any, req: any) {
    this.requestCall();
    return this.http.post(url, JSON.stringify(req)).pipe(
      catchError((error) => {
        return throwError(error);
      }),
      finalize(() => this.responseCall()));
  }

  /**
   * @param  {any} url
   * @param  {any} req
   * @param  {any} options
   * post call with options
   */
  postOptions(url: any, req: any, options: any) {
    this.requestCall();
    return this.http.post(url, req, options).pipe(
      catchError((error) => {
        return throwError(error);
      }),
      finalize(() => this.responseCall()));
  }
  /**
   * @param  {any} url
   * @param  {any} req
   * put call
   */
  put(url: any, req: any) {
    this.requestCall();
    return this.http.put(url, JSON.stringify(req)).pipe(
      catchError((error) => {
        return throwError(error);
      }),
      finalize(() => this.responseCall()));
  }
  /**
   * @param  {any} url
   * @param  {any} req
   * @param  {any} options
   * put option call
   */
  putOptions(url: any, req: any, options: any) {
    this.requestCall();
    return this.http.put(url, JSON.stringify(req), options).pipe(
      catchError((error) => {
        return throwError(error);
      }),
      finalize(() => this.responseCall()));
  }

  /**
   * @param  {any} url
   * @param  {any} req
   * patch call
   */
  patch(url: any, req: any) {
    this.requestCall();
    return this.http.patch(url, JSON.stringify(req), { responseType: 'text' as 'json' }).pipe(
      catchError((error) => {
        return throwError(error);
      }),
      finalize(() => this.responseCall()));
  }

  /**
   * @param  {any} url
   * delete call
   */
  delete(url: any) {
    this.requestCall();
    return this.http.delete(url, { responseType: 'text' as 'json' }).pipe(
      catchError((error) => {
        return throwError(error);
      }),
      finalize(() => this.responseCall()));
  }

  /**
   * on http request show loader
   */
  requestCall() {
    this.emitterService.loaderDataEmitChange(true);
  }

  /**
  * on http response hide loader
  */
  responseCall() {
    this.emitterService.loaderDataEmitChange(false);
  }
}
@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor, ErrorHandler {
  constructor(private toaster: NotificationService) { }

  handleError(error: any): void {
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;
    if (chunkFailedMessage.test(error)) {
      window.location.reload();
    }
  }
  handleErrors(err: HttpErrorResponse) {
    console.log(err);
    let errorMessage = err.error.message || err.message || "Sorry, something is wrong with the system. Please try after sometime.";
    switch (err.status) {
      case 404:
          break;
      case 500:
        // errorMessage = "";
          break;
      default:
        errorMessage = "Sorry, something is wrong with the system. Please try after sometime.";
    }
    this.toaster.showErrorToaster(errorMessage);
  } 

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq;
    if (req.url.indexOf('login') < 0 && req.url.indexOf('token') < 0) {
      const accesstoken = sessionStorage.getItem("login-token");
      authReq = req.clone({
        headers: req.headers
          .set('Authorization', "Bearer " + accesstoken)
      });
    } else if (req.url.indexOf('token') != -1) {
      authReq = req.clone({
        headers: req.headers
          .set('Content-Type', "application/x-www-form-urlencoded")
      });
    } else {
      authReq = req.clone({
        headers: req.headers.set('Content-Type', 'application/json')
      });
    }

    // send the newly created request
    return next.handle(authReq).pipe(catchError((err: HttpErrorResponse) => {
      this.handleErrors(err);
      return throwError(err);
    }));
  }
}
