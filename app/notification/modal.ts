export class ModalArgs {
    public message: string;
    public title: string;
    public blurToCancel: boolean = true;
    public onConfirm: () => void;
    public onCancel: () => void;
}