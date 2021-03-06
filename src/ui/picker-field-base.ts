import { TextField } from "tns-core-modules/ui/text-field";
import { GestureTypes, TouchGestureEventData } from "tns-core-modules/ui/gestures";
import { Property } from "tns-core-modules/ui/core/view";

export abstract class PickerFieldBase extends TextField {
    public locale: string;
    public pickerTitle: string;
    public pickerOkText: string;
    public pickerCancelText: string;

    private _tapHandler: (args: TouchGestureEventData) => void;

    constructor() {
        super();
        this.editable = false;
    }

    public static localeProperty = new Property<PickerFieldBase, string>({
        name: "locale",
        valueChanged: PickerFieldBase.localePropertyChanged
    });

    public static pickerTitleProperty = new Property<PickerFieldBase, string>({
        name: "pickerTitle"
    });

    public static pickerOkTextProperty = new Property<PickerFieldBase, string>({
        name: "pickerOkText"
    });

    public static pickerCancelTextProperty = new Property<PickerFieldBase, string>({
        name: "pickerCancelText"
    });

    public abstract open(): void;

    initNativeView() {
        super.initNativeView();
        this._updateHandler(true);
    }

    disposeNativeView() {
        this._updateHandler(false);
        super.disposeNativeView();
    }

    private static localePropertyChanged(field: PickerFieldBase, oldValue: any, newValue: any) {
        field.onLocaleChanged(oldValue, newValue);
    }

    protected onLocaleChanged(oldValue: string, newValue: string) {
    }

    private _updateHandler(subscribe: boolean) {
        if (subscribe) {
            this._tapHandler = this._tapHandler || ((args: TouchGestureEventData) => {
                this._onTap(args);
            });
            this.on(GestureTypes.tap, this._tapHandler);
        } else {
            this.off(GestureTypes.tap, this._tapHandler);
        }
    }

    private _onTap(args: TouchGestureEventData) {
        this.open();
    }
}

PickerFieldBase.localeProperty.register(PickerFieldBase);
PickerFieldBase.pickerTitleProperty.register(PickerFieldBase);
PickerFieldBase.pickerOkTextProperty.register(PickerFieldBase);
PickerFieldBase.pickerCancelTextProperty.register(PickerFieldBase);