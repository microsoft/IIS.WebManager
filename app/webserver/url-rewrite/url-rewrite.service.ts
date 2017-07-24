import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { HttpClient } from '../../common/httpclient';
import { ApiError, ApiErrorType } from '../../error/api-error';

@Injectable()
export class UrlRewriteService {
}
