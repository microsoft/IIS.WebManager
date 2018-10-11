
import { Injectable } from '@angular/core'

export interface Runtime {
    InitContext(): void
    DestroyContext(): void
}

@Injectable()
export class StandardRuntime implements Runtime {
    public InitContext(){}
    public DestroyContext(){}
}
