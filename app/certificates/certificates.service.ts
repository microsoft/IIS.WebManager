import { Injectable } from '@angular/core';
import { Response, RequestOptionsArgs, Headers } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { HttpClient } from '../common/httpclient';
import { Certificate } from './certificate'


@Injectable()
export class CertificatesService {
    private static URL: string = "/certificates/";
    private static FIELDS: string = "alias,name,friendly_name,issued_by,subject,thumbprint,signature_algorithm,valid_to,valid_from,intended_purposes,subject_alternative_names,store";
    private static RANGE_SIZE: number = 50;
    private _certificates: BehaviorSubject<Array<Certificate>> = new BehaviorSubject<Array<Certificate>>([]);
    private _stopRangeRetrievals: Subject<boolean> = new Subject<boolean>();

    constructor(private _http: HttpClient) {
    }

    public get certificates(): Observable<Array<Certificate>> {
        return this._certificates.asObservable();
    }

    public load() {
        this._certificates.getValue().splice(0);
        this._certificates.next(this._certificates.getValue());

        this.supportsRange()
            .then(result => {

                if (result) {
                    this._stopRangeRetrievals.next(true);
                    this.getAllByRange();
                }
                else {
                    this.getAll();
                }
            })
    }

    public get(id: string): Promise<Certificate> {
        let cached = this._certificates.getValue().find(c => c.id === id);

        if (cached) {
            return Promise.resolve(cached);
        }

        return this._http.get(CertificatesService.URL + id)
            .then(cert => {
                cached = this._certificates.getValue().find(c => c.id === id);
                if (!cached) {
                    this._certificates.getValue().push(cert);
                    this._certificates.next(this._certificates.getValue());
                    return cert;
                }
            });
    }



    private getAll() {
        return this._http.get(CertificatesService.URL + "?fields=" + CertificatesService.FIELDS)
            .then(obj => {
                let certs = obj.certificates;
                let current = this._certificates.getValue();
                certs.forEach(c => current.push(c));
                this._certificates.next(current);
            });
    }

    private getAllByRange(start: number = 0, total: number = 0) {
        let stop = false;
        let sub = this._stopRangeRetrievals.take(1).subscribe(() => {
            stop = true;
        });

        return (total == 0 ? this.getTotal() : Promise.resolve(total))
            .then(total => {
                let length = start + CertificatesService.RANGE_SIZE > total ? total - start : CertificatesService.RANGE_SIZE;
                return this.getRange(start, length)
                    .then(certs => {
                        if (stop) {
                            return this._certificates.getValue();
                        }

                        let current = this._certificates.getValue();
                        certs.forEach(c => current.push(c));
                        this._certificates.next(current);

                        if (start + length < total && !stop) {
                            return this.getAllByRange(start + length, total);
                        }
                        else {
                            sub.unsubscribe();
                            return this._certificates.getValue();
                        }
                    })
                    .catch(e => {
                        sub.unsubscribe();
                        throw e;
                    });
            })
    }

    private getRange(start: number, length: number): Promise<Array<Certificate>> {
        let args: RequestOptionsArgs = {};
        args.headers = new Headers();
        args.headers.append('range', 'certificates=' + start + '-' + (start + length - 1));

        return this._http.get(CertificatesService.URL + "?fields=" + CertificatesService.FIELDS, args)
            .then(res => {
                return res.certificates
            });
    }

    //
    // Range not supported in 1.0.39 and below
    private supportsRange(): Promise<boolean> {
        return this._http.head(CertificatesService.URL)
            .then((res: Response) => {
                return !!res.headers.get('Accept-Ranges');
            });
    }

    private getTotal(): Promise<number> {
        return this._http.head(CertificatesService.URL)
            .then((res: Response) => {
                return Number.parseInt(res.headers.get('x-total-count'));
            });
    }
}
