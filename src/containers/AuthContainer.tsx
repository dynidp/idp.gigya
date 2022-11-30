import React, {useEffect, useState, createContext, useContext} from "react";
import {authMachine, AuthService, AuthMachineContext, AuthMachine} from "../machines/authMachine";
import {useInterpret} from "@xstate/react";
import {RouteComponentProps } from "@reach/router";
import { navigate, redirectTo } from "@reach/router"
import { InterpreterFrom } from "xstate";
import {useInterpretWithLocalStorage} from "../machines/withLocalStorage";
import {createGigyaAuthMachine} from "../machines/createGigyaAuthMachine";

declare type GigyaAuthService=InterpreterFrom<typeof createGigyaAuthMachine>;
export const AuthContext = createContext<GigyaAuthService>({} as GigyaAuthService);
export type AuthProviderProps = RouteComponentProps

function OAuthProvider({ children}:React.PropsWithChildren) {

    const authService = useInterpret(() => createGigyaAuthMachine( {redirectTo,navigate, location }));
 
    return  <AuthContext.Provider value={authService}>
        {children}
    </AuthContext.Provider>
}
export const AuthProvider =OAuthProvider;