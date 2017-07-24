import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { NotificationService } from '../../notification/notification.service';

@Component({
    template: `
        <div>
            <rule-wizard></rule-wizard>
        </div>
    `
})
export class UrlRewriteComponent {
}
