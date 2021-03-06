import { Color } from "tns-core-modules/color";
import { View, ios as iosView } from "tns-core-modules/ui/core/view";
import {
    DateTimePickerBase, DateTimePickerStyleBase, getCurrentPage,
    DatePickerOptions, TimePickerOptions, PickerOptions
} from "./datetimepicker.common";
import { LocalizationUtils } from "./utils/localization-utils";
import { getDateNow, getDateToday } from "./utils/date-utils";

export class DateTimePickerStyle extends DateTimePickerStyleBase {
}

export class DateTimePicker extends DateTimePickerBase {
    public static PICKER_DEFAULT_MESSAGE_HEIGHT = 192;
    public static PICKER_WIDTH_INSETS = 16;
    public static PICKER_DEFAULT_TITLE_OFFSET = 26.5;
    public static PICKER_DEFAULT_TITLE_HEIGHT = 16;
    public static PICKER_DEFAULT_MESSAGE = "\n\n\n\n\n\n\n\n\n";

    static pickDate(options: DatePickerOptions, style?: DateTimePickerStyle): Promise<Date> {
        const pickDate = new Promise<Date>((resolve) => {
            const nativeDatePicker = DateTimePicker._createNativeDatePicker(options);
            const nativeDialog = DateTimePicker._createNativeDialog(nativeDatePicker, options, style, (result) => {
                resolve(result);
            });
            DateTimePicker._showNativeDialog(nativeDialog, nativeDatePicker, style);
        });
        return pickDate;
    }

    static pickTime(options: TimePickerOptions, style?: DateTimePickerStyle): Promise<Date> {
        const pickTime = new Promise<Date>((resolve) => {
            const nativeTimePicker = DateTimePicker._createNativeTimePicker(options);
            const nativeDialog = DateTimePicker._createNativeDialog(nativeTimePicker, options, style, (result) => {
                resolve(result);
            });
            DateTimePicker._showNativeDialog(nativeDialog, nativeTimePicker, style);
        });
        return pickTime;
    }

    static _createNativeDatePicker(options: DatePickerOptions): UIDatePicker {
        const pickerView = UIDatePicker.alloc().initWithFrame(CGRectZero);
        pickerView.datePickerMode = UIDatePickerMode.Date;
        const date = options.date ? options.date : getDateToday();
        pickerView.date = date;
        if (options.maxDate) {
            pickerView.maximumDate = options.maxDate;
        }
        if (options.minDate) {
            pickerView.minimumDate = options.minDate;
        }
        if (options.locale) {
            pickerView.locale = LocalizationUtils.createNativeLocale(options.locale);
        }
        return pickerView;
    }

    static _createNativeTimePicker(options: TimePickerOptions): UIDatePicker {
        const pickerView = UIDatePicker.alloc().initWithFrame(CGRectZero);
        pickerView.datePickerMode = UIDatePickerMode.Time;
        const time = options.time ? options.time : getDateNow();
        pickerView.date = time;
        if (options.locale) {
            pickerView.locale = LocalizationUtils.createNativeLocale(options.locale);
        }
        return pickerView;
    }

    static _createNativeDialog(nativePicker: UIDatePicker, options: PickerOptions, style: DateTimePickerStyle, callback: Function) {
        const alertTitle = options.title ? options.title : "";
        const alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(
            alertTitle, DateTimePicker.PICKER_DEFAULT_MESSAGE, UIAlertControllerStyle.ActionSheet);
        const alertSize = Math.min(alertController.view.frame.size.width, alertController.view.frame.size.height);
        const pickerViewWidth = alertSize - DateTimePicker.PICKER_WIDTH_INSETS;

        let pickerContainerFrameTop = DateTimePicker.PICKER_DEFAULT_TITLE_OFFSET;
        if (options.title) {
            pickerContainerFrameTop += DateTimePicker.PICKER_DEFAULT_TITLE_HEIGHT;
        }
        const pickerViewHeight = DateTimePicker.PICKER_DEFAULT_MESSAGE_HEIGHT;
        const pickerContainerFrame = CGRectMake(0, pickerContainerFrameTop, pickerViewWidth, pickerViewHeight);
        const pickerContainer = UIView.alloc().initWithFrame(pickerContainerFrame);
        let spinnersBackgroundColor = new Color("transparent");
        let spinnersTextColor = null;
        if (style) {
            spinnersBackgroundColor = style.spinnersBackgroundColor ? style.spinnersBackgroundColor : spinnersBackgroundColor;
            spinnersTextColor = style.spinnersTextColor;
        }
        DateTimePicker._applyDialogSpinnersColors(nativePicker, pickerContainer, spinnersTextColor, spinnersBackgroundColor);

        const pickerView = nativePicker;
        pickerView.frame = CGRectMake(0, 0, pickerViewWidth, pickerViewHeight);
        pickerContainer.addSubview(pickerView);

        const messageLabel = DateTimePicker._findLabelWithText(alertController.view, DateTimePicker.PICKER_DEFAULT_MESSAGE);
        const messageLabelContainer = messageLabel.superview;
        messageLabelContainer.clipsToBounds = true;
        messageLabelContainer.addSubview(pickerContainer);

        const cancelButtonText = options.cancelButtonText ? options.cancelButtonText : "Cancel";
        const okButtonText = options.okButtonText ? options.okButtonText : "OK";
        const cancelActionStyle = (style && style.buttonCancelBackgroundColor) ? UIAlertActionStyle.Default : UIAlertActionStyle.Cancel;
        let cancelAction = UIAlertAction.actionWithTitleStyleHandler(cancelButtonText, cancelActionStyle, () => {
            callback(null);
        });
        let okAction = UIAlertAction.actionWithTitleStyleHandler(okButtonText, UIAlertActionStyle.Default, () => {
            callback(pickerView.date);
        });
        alertController.addAction(okAction);
        if (cancelButtonText) {
            alertController.addAction(cancelAction);
        }
        if (style) {
            const buttonOkTextColor = style.buttonOkTextColor ? style.buttonOkTextColor : style.buttonsTextColor;
            const buttonCancelTextColor = style.buttonCancelTextColor ? style.buttonCancelTextColor : style.buttonsTextColor;
            DateTimePicker._applyDialogButtonTextColor(okAction, buttonOkTextColor);
            DateTimePicker._applyDialogButtonTextColor(cancelAction, buttonCancelTextColor);
            DateTimePicker._applyDialogTitleTextColor(alertController, style.titleTextColor);
            DateTimePicker._applyBackgroundColors(messageLabelContainer, style);
        }
        return alertController;
    }

    static _showNativeDialog(nativeDialog: UIAlertController, nativePicker: UIDatePicker, style: DateTimePickerStyle) {
        let currentPage = getCurrentPage();
        if (currentPage) {
            let view: View = currentPage;
            let viewController: UIViewController = currentPage.ios;

            if (currentPage.modal) {
                view = currentPage.modal;

                if (view.ios instanceof UIViewController) {
                    viewController = view.ios;
                } else {
                    const parentWithController = iosView.getParentWithViewController(view);
                    viewController = parentWithController ? parentWithController.viewController : undefined;
                }
            }

            if (viewController) {
                if (nativeDialog.popoverPresentationController) {
                    nativeDialog.popoverPresentationController.sourceView = viewController.view;
                    nativeDialog.popoverPresentationController.sourceRect = CGRectMake(viewController.view.bounds.size.width / 2.0, viewController.view.bounds.size.height / 2.0, 1.0, 1.0);
                    nativeDialog.popoverPresentationController.permittedArrowDirections = 0;
                }

                viewController.presentViewControllerAnimatedCompletion(nativeDialog, true, () => {
                });
            }
        }
    }

    private static _applyDialogTitleTextColor(nativeDialog: UIAlertController, color: Color) {
        if (color) {
            if (nativeDialog.title) {
                let title = NSAttributedString.alloc().initWithStringAttributes(nativeDialog.title, <any>{ [NSForegroundColorAttributeName]: color.ios });
                nativeDialog.setValueForKey(title, "attributedTitle");
            }
        }
    }

    private static _applyDialogSpinnersColors(nativePicker: UIDatePicker, nativeContainer: UIView, color: Color, backgroundColor: Color) {
        if (backgroundColor) {
            nativeContainer.backgroundColor = backgroundColor.ios;
        }
        if (color) {
            nativePicker.setValueForKey(color.ios, "textColor");
        }
    }

    private static _applyDialogButtonTextColor(action: UIAlertAction, textColor: Color) {
        if (textColor) {
            action.setValueForKey(textColor.ios, "titleTextColor");
        }
    }

    private static _applyBackgroundColors(labelContainer: UIView, style: DateTimePickerStyle) {
        if (!labelContainer || !style) {
            return;
        }
        if (labelContainer.superview && labelContainer.superview.superview) {
            const mainContainer = labelContainer.superview.superview;
            if (style.dialogBackgroundColor) {
                mainContainer.backgroundColor = style.dialogBackgroundColor.ios;
            }
            const buttonsContainer = mainContainer.subviews.lastObject;
            let buttonsBackground = style.buttonCancelBackgroundColor;
            if (!buttonsBackground) {
                buttonsBackground = style.buttonOkBackgroundColor;
                if (!buttonsBackground) {
                    buttonsBackground = style.buttonsBackgroundColor;
                }
            }
            if (buttonsContainer && buttonsBackground) {
                buttonsContainer.backgroundColor = buttonsBackground.ios;
            }
        }
    }

    private static _findLabelWithText(uiView: UIView, text: string) {
        if ((uiView instanceof UILabel) && uiView.text === text) {
            return uiView;
        }
        const subViewsCount = uiView.subviews.count;
        for (let i = 0; i < subViewsCount; i++) {
            let label = DateTimePicker._findLabelWithText(uiView.subviews[i], text);
            if (label) {
                return label;
            }
        }
        return null;
    }
}