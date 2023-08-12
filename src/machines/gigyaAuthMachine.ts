import {
    getAccount,
    getJwt,
    logout,
    performSignin,
    performSignup,
    socialLoginAsync,
    SocialLoginParams
} from "../gigya/gigyaWebSDK";
import {omit} from "lodash/fp";
import {AuthMachine, createAuthMachine} from "./authMachine";
import gigyaWebSDK from "../gigya/gigyaWebSDK";
import {GigyaSdk, loader} from "../gigya/gigyaLoadMachine";
import {assign} from "xstate";
import {User} from "../models";
import {UserInfo} from "../gigya/models";
import {Application, Context, getFakeConsent, UIDParams} from "../gigya/consnetFacker";
import {AnyRecord} from "dns";

function toMfa(tokenDetails: any) {
    return {
        ...{...tokenDetails.sub_id?.sub_id || {}},
        ...omit('sub_id', tokenDetails || {})
    }
}

export const createGigyaAuthMachine = (config: { redirectTo: (uri: string) => void, navigate: (path: string) => {}, location: { pathname: string, search: string, hash: string } }) =>
    createAuthMachine({
        service: undefined as unknown as GigyaSdk || undefined,
        user: undefined as unknown as User & UserInfo || undefined,
        ...config,
        application: {
            key: 'ABt0SHN2ln+G',
            secret: 'rwaGrCmXmDEpvBxiGDqRJNprmSydoi7W'
        } as Application
    })
        .withConfig({
            services: {

                performSignup: async (ctx, event) => {
                    const payload = omit("type", event);
                    return await performSignup(payload)
                },
                performLogin: async (ctx, event) => {
                    const payload = omit("type", event);
                    const loginMode = ctx.user ? "reAuth" : "standard"
                    return await performSignin({...payload, loginMode})
                },
                getToken: async (ctx, event) => {
                    const payload = omit("type", event);
                    const idToken = await getJwt(payload);
                    const tokenDetails = decodeJwt(idToken as string);

                    const mfaToken = decodeJwt(idToken as string);
                    const forMfa = toMfa(mfaToken);
                    delete mfaToken.sub_id;
                    delete mfaToken.amr;
                    delete mfaToken.email;
                    mfaToken.sub_ids = [forMfa];

                    return {
                        idToken: {raw: idToken, details: tokenDetails},
                        mfaToken,
                        access_token: btoa(JSON.stringify(mfaToken))
                    };
                },

                enrichToken: async (ctx, event) => {
                    const payload = omit("type", event);
                    const idToken = await getJwt(payload);
                    const tokenDetails = decodeJwt(idToken as string);
                    const mfaToken = ctx.mfaToken;
                    const forMfa = toMfa(decodeJwt(idToken as string));
                    mfaToken.sub_ids = [...mfaToken.sub_ids, forMfa];
                    return {
                        idToken: {raw: idToken, details: tokenDetails},
                        mfaToken,
                        access_token: btoa(JSON.stringify(mfaToken))
                    };

                    function decodeJwt(token?: string) {

                        return token && token.split && JSON.parse(atob(token.split('.')[1]));

                    }


                },
                performSocialLogin: async (ctx, event) => {
                    if (event.type === "SOCIAL") {
                        const payload = omit("type", event);
                        const loginMode = ctx.user ? "reAuth" : "standard"

                        return await socialLoginAsync({...payload, loginMode} as SocialLoginParams);
                    }

                },
                getUserProfile: async (ctx, event) => {
                    const payload = omit("type", event);
                    const user = await getAccount(payload);
                    return {user: {...(user?.userInfo || {}), photo: user?.profile?.photoURL}};
                },
                performLogout: async (ctx, event) => {
                    localStorage.removeItem("authState");
                    return await logout();
                },
                /*'login-service':loginMachine.withConfig({
                    services:{
                        performSignup: async (ctx, event) => {
                            const payload = omit("type", event);
                            return await performSignup(payload)
                        },
                        performLogin: async (ctx, event) => {
                            const payload = omit("type", event);
                            const loginMode =ctx.user? "reAuth" : "standard"
                            return await performSignin({...payload, loginMode})
                        },
                        performSocialLogin: async (ctx, event) => {
                            if (event.type == "SOCIAL") {
                                const payload = omit("type", event);
                                const loginMode =ctx.user? "reAuth" :  "standard"
        
                                return await  socialLoginAsync({...payload, loginMode} as SocialLoginParams);
                                     loader: (context, event) => loader,
       }
        
                        },
                    }
                })*/
            },
            actions: {
                onAuthorizedEntry: continueOIDC,
                onLoaded: assign({
                    service: (ctx, event: { service: GigyaSdk } | { data: { service: GigyaSdk } } | any) =>
                        event.service || (event.data && event.data.service)
                })

                /*onAuthorizedEntry: async (ctx, event) => {
                    const url =  gigyaWebSDK().utils.URL.addParamsToURL("",{
                        mode: 'afterLogin',
                        gig_skipConsent: true
                    });
                        ctx.navigate(url,{replace:true});
                    
                    //
                    // },
                }*/
            }
        });


async function continueOIDC(ctx: { service: GigyaSdk, application: Application, user: UIDParams, redirectTo: (uri: string) => void, location: { search: string, hash: string } }, event: any) {

    const {location, user, redirectTo} = ctx;
    const params = getParams(location);
    const {context, mode, domain} = params;
    if (mode == 'error' || !context) {
        return;
    }
    const loginToken = gigyaWebSDK()._.apiAdapters.web.tokenStore.get();
    const consent = await getFakeConsent({...ctx, params: params});
    console.log(consent);
    await gigyaWebSDK().fidm.oidc.op.redirectToContinue({
        opKey: gigyaWebSDK().apiKey,
        ...consent,
        context,
        login_token: loginToken
    });

 /*   async function redirectToContinue(params: any) {
        redirectToContinueEndPoint('authorize/continue', {
            context: context,
            login_token: params.login_token,
            ...consent,
            gmidTicket: await gigyaWebSDK()._.apiAdapter.getGmidTicket()
        }, params.opKey);
    }

    function redirectToContinueEndPoint(endPoint: string, params: AnyRecord, apiKey: string) {
        const url = gigyaWebSDK().utils.URL.addParamsToURL(`https://${domain || gigyaWebSDK()._.getApiDomain('fidm')}/oidc/op/v1.0/${apiKey}/${endPoint}`, params);
        redirectTo(url);
    }*/

}

export function getParams({search, hash}: { search: string, hash: string }): Context {
    const result = new URLSearchParams(hash || search);

    return {
        mode: result.get('mode') || undefined,
        context: result.get('context') || undefined,
        clientID: result.get('client_id') || result.get('clientID') || undefined,
        scope: result.get('scope') || undefined,
        prompt: result.get('prompt'),
        display: result.get('display'),
        message: result.get('errorMessage'),
        code: result.get('errorCode'),
        callID: result.get('callId'),
        skipConsent: result.get('gig_skipConsent') || false,
        domain: result.get('domain') || undefined
    }


}

function decodeJwt(token?: string) {

    return token && token.split && JSON.parse(atob(token.split('.')[1]));

}  