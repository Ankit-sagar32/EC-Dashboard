import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
/**
 * @author Ankit
 */
export class EmitterService {
    // error message emiter
    private message = new BehaviorSubject<any>(0);
    errorDataChangeEmitted$ = this.message.asObservable();

    // request and response call emitter
    private loaderData = new Subject<any>();
    loaderDataChangeEmitted$ = this.loaderData.asObservable();

    sendMessage(message: string) {
        this.message.next(message);
    }

    loaderDataEmitChange(myMessage: any) {
        this.loaderData.next(myMessage);
    }

}
