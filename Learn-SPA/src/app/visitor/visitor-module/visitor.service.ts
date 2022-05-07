import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InvestorViewModel } from 'src/app/models/investor';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'any'
})
export class VisitorService {
    private clientAuthBase = environment.Url + 'api/clientauth';

    constructor(private http: HttpClient) { }

    // Register Investor
    registerInvestor(investor: InvestorViewModel): Observable<any> {
        return this.http.post<any>(this.clientAuthBase + '/investor/register', investor);
    }

    // Confirm investor email
    confirmEmail(email: string, token: string): Observable<any> {
        let params = new HttpParams();
        if (email !== null) {
            params = params.append('email', email);
        }
        if (token !== null) {
            params = params.append('token', token);
        }

        return this.http.get<any>(this.clientAuthBase + '/confirmemail', { params });
    }

}
