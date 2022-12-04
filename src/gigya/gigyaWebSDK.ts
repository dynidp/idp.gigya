// @ts-nocheck - may need to be at the start of file
import gigyaWebSDK from "./gigyaWebSDK";
import {SocialPayload} from "../machines/authMachine";
import {Account, IBaseEvent, IErrorEvent, ILoginEvent} from "./models";
 
// @ts-ignore

declare type AnyRequest = { [key: string]: any } | undefined;

export async function performSignup(args: any) {
  return new Promise((resolve, reject) => {
    initRegistration().then(regToken =>
        gigyaWebSDK().accounts.register({
          email: args.email,
          password: args.password,
          finalizeRegistration: true,
          regToken: regToken,
          callback: (response) => {
            if (response.errorCode === 0) {
              resolve(response);

            } else {
              reject(
                  `Error during registration: ${response.errorMessage}, ${response.errorDetails}`
              );
            }
          },
        }))

  });
}

export async function performSignupWithSS(args: any) {
  return new Promise((resolve, reject) => {

    gigyaWebSDK().accounts.showScreenSet(
        {
          ...args,
          screenSet: "Default-RegistrationLogin",
          startScreen: 'gigya-register-screen',
          onLogin: (r) => {
            resolve(r)
          },
          callback: (response) => {
            if (response.errorCode === 0) {
              resolve(response);

            }
            if (response.errorCode !== 0) {
              reject(
                  `Error during registration: ${response.errorMessage}, ${response.errorDetails}`
              );
            }
          },
        })

  });
}

export async function initRegistration(args?: any) {
  return new Promise((resolve, reject) => {
    gigyaWebSDK().accounts.initRegistration({
      callback: (response) => {
        if (response.errorCode === 0) {
          resolve(response.regToken);

        } else {
          reject(
              `Error during registration: ${response.errorMessage}, ${response.errorDetails}`
          );
        }
      },
    });


  });
}

export async function performSignin(args) {
  return new Promise((resolve, reject) => {
    const params = {
      loginID: args.email,
      password: args.password,
      ...args
    };
    gigyaWebSDK().accounts.login(params, {
      callback: (response) => {
        if (response.errorCode === 0) {
          resolve(response);
        } else {
          reject(
              `Error during login: ${response.errorMessage}, ${response.errorDetails}`
          );
        }
      }


    });

  });

}

export function getJwt(args: any) {
  return new Promise((resolve, reject) => {
    gigyaWebSDK().accounts.getJWT({
      ...(args || {}),
      fields: 'phone_number,isRegistered,authMethods,email,provider',
      callback: function (res:ILoginEvent ) {
        if (res.errorCode === 0) {
          resolve(res.id_token as string)
        } else {
          reject(res)
        }

      }
    })
  });
}




// @ts-ignore
export function getAccount(args): Promise<Account> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    gigyaWebSDK().accounts.getAccountInfo({
      ...(args || {}),
      include: "all",
      callback: function (res) {
        if (res.errorCode === 0) {
          resolve(res)
        } else {
          reject(res)
        }

      }
    })
  });
}

export type LoginParams = {
  [key: string]: any
loginMode?: string
}

export type SocialLoginParams = SocialPayload & LoginParams

export const socialLoginAsync = (args: SocialLoginParams) => {
  return new Promise((resolve, reject) => {
    const params = {
      ...(args || {}),
      include: "all",
      callback: function (res) {
        if (res.errorCode === 0) {
          resolve(res)
        } else {
          reject(res)
        }

      }
    };
    window.gigya.socialize.login({...params, enabledProviders: params.provider});
  });
}
export const socialLogin = (args: { provider: string, [key: string]: any }, callback: (res) => {}) => {
  const params = {
    ...(args || {}),
    include: "all",
    callback: callback
  }
  gigyaWebSDK().socialize.login({...params, enabledProviders: params.provider});
}
export const startFlow = (args: { provider: string, [key: string]: any }, callback: (res) => {}) => {
  const params = {
    ...(args || {}),
    include: "all",
    callback: callback
  }
  gigyaWebSDK().identityFlows.start({...params, enabledProviders: params.provider});
}


export const logout = (args: AnyRequest = {}) => {
  return new Promise((resolve, reject) => {
    const params = {
      ...(args || {}),
      callback: function (res) {
        if (res.errorCode === 0) {
          resolve(res)
        } else {
          reject(res)
        }

      }
    };
    gigyaWebSDK().socialize.logout({...params});
  });
}



export default ()=>window.gigya;
