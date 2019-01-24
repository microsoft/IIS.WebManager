import { Injectable } from '@angular/core';
import { Response, RequestOptionsArgs, Headers } from '@angular/http';
import { Observable, Subscription, Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '../common/httpclient';
import { Certificate } from './certificate'

export const CertificatesServiceURL: string = "/certificates/";

@Injectable()
export class CertificatesService {
    private static FIELDS: string = "alias,name,friendly_name,issued_by,subject,thumbprint,signature_algorithm,valid_to,valid_from,intended_purposes,subject_alternative_names,store";
    private static RANGE_SIZE: number = 50;
    private _certificates: BehaviorSubject<Array<Certificate>> = new BehaviorSubject<Array<Certificate>>([]);
    private _stopRetrievals: Subject<boolean> = new Subject<boolean>();
    private _loading: number = 0;

    constructor(private _http: HttpClient) {
    }

    public get certificates(): Observable<Array<Certificate>> {
        return this._certificates.asObservable();
    }

    public get loading(): boolean {
        return this._loading != 0;
    }

    public load(): Promise<any> {
        this._certificates.getValue().splice(0);
        this._certificates.next(this._certificates.getValue());

        return this.supportsRange()
            .then(result => {
                if (result) {
                    this._stopRetrievals.next(true);
                    return this.getAllByRange();
                }
                else {
                    return this.getAll();
                }
            })
    }

    public get(id: string): Promise<Certificate> {
        let cached = this._certificates.getValue().find(c => c.id === id);

        if (cached) {
            return Promise.resolve(cached);
        }

        return this._http.get(CertificatesServiceURL + id)
            .then(cert => {
                cached = this._certificates.getValue().find(c => c.id === id);
                if (!cached) {
                    this._certificates.getValue().push(cert);
                    this._certificates.next(this._certificates.getValue());
                    return cert;
                }
            });
    }



    private getAll(): Promise<Array<Certificate>> {
        this._loading++;
        return this._http.get(CertificatesServiceURL + "?fields=" + CertificatesService.FIELDS)
            .then(obj => {
                this._loading--;
                let certs = obj.certificates;
                let current = this._certificates.getValue();
                certs.forEach(c => current.push(c));
                this._certificates.next(current);
                return current;
            })
            .catch(e => {
                this._loading--;
                throw e;
            });
    }

    private getAllByRange(start: number = 0, total: number = 0): Promise<Array<Certificate>> {
        let stop = false;
        let sub = <Subscription>(<any>this._stopRetrievals).take(1).subscribe(() => {
            stop = true;
        });

        if (start == 0) {
            this._loading++;
        }

        return (total == 0 ? this.getTotal() : Promise.resolve(total))
            .then(total => {
                let length = start + CertificatesService.RANGE_SIZE > total ? total - start : CertificatesService.RANGE_SIZE;
                return this.getRange(start, length)
                    .then(certs => {
                        if (stop) {
                            this._loading--;
                            return this._certificates.getValue();
                        }

                        let current = this._certificates.getValue();
                        certs.forEach(c => current.push(c));
                        this._certificates.next(current);

                        if (start + length < total && !stop) {
                            return this.getAllByRange(start + length, total);
                        }
                        else {
                            this._loading--;
                            sub.unsubscribe();
                            return this._certificates.getValue();
                        }
                    })
                    .catch(e => {
                        this._loading--;
                        sub.unsubscribe();
                        throw e;
                    });
            })
    }

    private getRange(start: number, length: number): Promise<Array<Certificate>> {
        let args: RequestOptionsArgs = {};
        args.headers = new Headers();
        args.headers.append('range', 'certificates=' + start + '-' + (start + length - 1));

        return this._http.get(CertificatesServiceURL + "?fields=" + CertificatesService.FIELDS, args)
            .then(res => {
                return res.certificates
            });
    }

    //
    // Range not supported in 1.0.39 and below
    private supportsRange(): Promise<boolean> {
        return this._http.head(CertificatesServiceURL)
            .then((res: Response) => {
                return !!res.headers.get('Accept-Ranges');
            });
    }

    private getTotal(): Promise<number> {
        return this._http.head(CertificatesServiceURL)
            .then((res: Response) => {
                return Number.parseInt(res.headers.get('x-total-count'));
            });
    }
}
