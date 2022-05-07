import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PreloaderService {

  private readonly events = new BehaviorSubject<boolean>(false);
  constructor() {}

  public showSpinner(): void {
    this.events.next(true);
  }

  public hideSpinner(): void {
    this.events.next(false);
  }

  public get spinnerStatus(): Observable<boolean> {
    return this.events.asObservable();
  }
}
