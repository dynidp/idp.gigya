import {Data, Profile} from "./account";

export interface IBaseEvent {
    eventName: string;
    source: string;
    context: any;
    errorCode: number;

}

export interface IBaseGlobalEvent extends IBaseEvent {

}

export interface ILoginEvent extends IBaseGlobalEvent {
    UID: string;
    UIDSignature: string;
    signatureTimestamp: string;
    loginMode: string;
    newUser: boolean;
    provider: string;
    profile: Profile;
    data: Data;
    remember: boolean;
    dataCenter?: string;
    id_token: string;
}

export interface ILogoutEvent extends IBaseGlobalEvent {

}

export interface IBaseScreenSetEvent extends IBaseEvent {
    instanceID?: string;
}

export interface IErrorEvent extends IBaseScreenSetEvent {
    response: any;
    status: string,
    statusMessage: string;
    errorMessage: string;
    errorDetails: string;
    errorCode: number ;
}

export interface IBeforeValidationEvent extends IBaseScreenSetEvent {
    form: string;
    formData: any;
    data: any;
    profile: any;
    preferences: any;
    subscriptions: any;
    screen: string;
}

export interface IBeforeSubmitEvent extends IBaseScreenSetEvent {
    screen: string;
    form: string;
    profile: any;
    data: any;
    subscriptions: any;
    formData: any;
    preferences: any;
}

export interface ISubmitEvent extends IBaseScreenSetEvent {
    screen: string;
    form: string;
    accountInfo: any;
    formModel: any;
}

export interface IAfterValidationEvent extends IBaseScreenSetEvent {
    screen: string;
    form: string;
    profile: any;
    data: any;
    preferences: any;
    response: any;
    formData: any;
    validationErrors: any;
}

export interface IAfterSubmitEvent extends IBaseScreenSetEvent {
    screen: string;
    form: string;
    profile: any;
    data: any;
    preferences: any;
    response: any;
    subscriptions: any;
}

export interface IBeforeScreenLoadEvent extends IBaseScreenSetEvent {
    profile: any;
    data: any;
    preferences: any;
    response: any;
    nextScreen: string;
    schema: any;
}

export interface IAfterScreenLoadEvent extends IBaseScreenSetEvent {
    currentScreen: string;
    abTesting: {
        variantId: string;
        testId: string;
    }
    profile: any;
    data: any;
    preferences: any;
    response: any;
}

export interface IOnFieldChangedEvent extends IBaseScreenSetEvent {
    screen: string;
    form: string;
    field: string;
    isValid: boolean;
    errMsg: number;
    value: string;
}

export interface IHideEvent extends IBaseScreenSetEvent {
    reason: string;
}

export type BeforeValidationEventHandler = (e: IBeforeValidationEvent) => object | Promise<Object>;
export type BeforeSubmitEventHandler = (e: IBeforeSubmitEvent) => void | boolean; // Return Value: The event handler function may return "false" to cancel the submission.
export type BeforeScreenLoadEventHandler = (e: IBeforeScreenLoadEvent) => void;
export type AfterScreenLoadEventHandler = (e: IAfterScreenLoadEvent) => void;
export type FieldChangedEventHandler = (e: IOnFieldChangedEvent) => void;
export type AfterValidationEventHandler = (e: IAfterValidationEvent) => void;
export type AfterSubmitEventHandler = (e: IAfterSubmitEvent) => void;
export type SubmitEventHandler = (e: ISubmitEvent) => void;
export type ErrorEventHandler = (e: IErrorEvent) => void;
export type HideEventHandler = (e: IHideEvent) => void;

export interface ScreenSetHooks {
    onHide: Array<HideEventHandler>;
    onError: Array<ErrorEventHandler>;
    onBeforeValidation: Array<BeforeValidationEventHandler>;
    onAfterValidation: Array<AfterValidationEventHandler>;
    onSubmit: Array<SubmitEventHandler>;
    onAfterSubmit: Array<AfterSubmitEventHandler>;
    onBeforeSubmit: Array<BeforeSubmitEventHandler>;
    onAfterScreenLoad: Array<AfterScreenLoadEventHandler>;
    onBeforeScreenLoad: Array<BeforeScreenLoadEventHandler>;
    onFieldChanged: Array<FieldChangedEventHandler>;
}

export interface ScreenSetListeners {
    onHide: HideEventHandler;
    onError: ErrorEventHandler;
    onBeforeValidation: BeforeValidationEventHandler;
    onAfterValidation: AfterValidationEventHandler;
    onSubmit: SubmitEventHandler;
    onAfterSubmit: AfterSubmitEventHandler;
    onBeforeSubmit: BeforeSubmitEventHandler;
    onAfterScreenLoad: AfterScreenLoadEventHandler;
    onBeforeScreenLoad: BeforeScreenLoadEventHandler;
    onFieldChanged: FieldChangedEventHandler;
}

export interface ScreenSetParams {
    screenSet: string;
    startScreen: string;
    containerID: string;
    authFlow: AuthFlow;
    cid: string;
    customButtons: Object[];
    customLang: { [key: string]: string };
    dialogStyle: DialogStyle;
    deviceType: DeviceType;
    enabledProviders: string;
    googlePlayAppID: string;
    lang: string;
    mobileScreenSet: string;
    redirectMethod: RedirectMethod;
    redirectURL: string;
    sessionExpiration: SessionExpiration;
    regSource: string;
    regToken: string;
    context: string;
    onError: ErrorEventHandler;
    onSubmit: SubmitEventHandler;
    onAfterSubmit: AfterSubmitEventHandler;
    onBeforeSubmit: BeforeSubmitEventHandler;
    onAfterScreenLoad: AfterScreenLoadEventHandler;
    onBeforeScreenLoad: BeforeScreenLoadEventHandler;
    onFieldChanged: FieldChangedEventHandler;
    onBeforeValidation: BeforeValidationEventHandler;
    onAfterValidation: AfterValidationEventHandler;
    onHide: HideEventHandler;
    version?: number;
    finalizeRegistration: boolean;
}

export enum AuthFlow {
    popup,
    redirect
}

export enum DialogStyle {
    modern,
    legacy
}

export enum DeviceType {
    desktop,
    mobile,
    auto
}

export enum RedirectMethod {
    get,
    post
}

export enum SessionExpiration {
    Session = 0,
    OneMinute = -1,
    Forever = -2
}

export type ScreenSet = {
    html: string;
    css: string;
    javascript: string;
    translations: TranslationsContainer
};


export type Translations = { [key: string]: string };
export type TranslationsContainer = { [langCode: string]: Translations };
export type TranslationWrapper = {
    langKey: string,
    translations: Translations
};


