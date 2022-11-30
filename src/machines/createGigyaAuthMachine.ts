import {
    getAccount,
    getJwt,
    logout,
    performSignin,
    performSignup,
    socialLoginAsync,
    SocialLoginParams
} from "../gigya/gigyaAuthMachine";
import {omit} from "lodash/fp";
import {AuthMachine, createAuthMachine} from "./authMachine";
import gigyaWebSDK from "../gigya/gigyaWebSDK";
import {loader} from "../gigya/gigyaLoadMachine";
import {assign} from "xstate";
import {User} from "../models";
import {UserInfo} from "../gigya/models";
import {Application, Context, getFakeConsent, UIDParams} from "../gigya/consnetFacker";

function toMfa(tokenDetails: any) {
    return {
        ...{...tokenDetails.sub_id?.sub_id || {}},
        ...omit('sub_id', tokenDetails || {})
    }
}

export const createGigyaAuthMachine = ( config: { redirectTo: (uri: string) => void, navigate: (path: string) => {}, location: { pathname: string, search:string, hash:string } }) => 
    createAuthMachine({
        user: undefined as unknown as User & UserInfo || undefined,
        ...config,
        application: {
            key: 'ABt0SHN2ln+G',
            secret: 'rwaGrCmXmDEpvBxiGDqRJNprmSydoi7W'
        } as Application
    }) 
    .withConfig({
        services: {
            loader: (context, event) => loader,

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
                        }
    
                    },
                }
            })*/
        },
        actions: {
            onAuthorizedEntry: continueOIDC


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



async function continueOIDC(ctx:{application:Application, user:UIDParams, location:{search:string, hash:string}}, event:any) {

    const {location, user} = ctx;
    const context = gigyaWebSDK().getUrlParam('context');
    if(!context || !user){
        return;
    }
    const loginToken = gigyaWebSDK()._.apiAdapters.web.tokenStore.get();
    const consent = await getFakeConsent({...ctx, params:getParams(location)});
    gigyaWebSDK().fidm.oidc.op.redirectToContinue({
        opKey: gigyaWebSDK().apiKey,
        ...consent,
        context,
        login_token: loginToken
    });


 
}
export function getParams({search, hash}:{search:string, hash:string}):Context {
     const result = new URLSearchParams(hash || search);

    return {
        mode: result.get('mode') || undefined,
        context: result.get('context') ||undefined,
        clientID: result.get('client_id')|| result.get('clientID') ||undefined,
        scope: result.get('scope') ||undefined,
        prompt: result.get('prompt'),
        display: result.get('display'),
        message: result.get('errorMessage'),
        code: result.get('errorCode'),
        callID: result.get('callId'),
        skipConsent: result.get('gig_skipConsent') || false
    }

   /* export function urlParams(query:string) {
        if (query.indexOf('?') > -1)
            query = query.substring(query.indexOf('?') + 1);
        const queryParts = query.split(/&/);
        const params = {};
        for (let i = 0; i < queryParts.length; ++i) {
            const param = queryParts[i];
            if (param.indexOf('=') === -1)
                continue;
            const paramParts = param.split('=');
            if (paramParts.length !== 2)
                continue;
            params[paramParts[0]] = decodeURIComponent(paramParts[1]);
        }
        return params;
    }*/

}

function decodeJwt(token?: string) {

    return token && token.split && JSON.parse(atob(token.split('.')[1]));

}  