import React, {useEffect, useState, createContext, useContext} from "react";
import {useInterpret} from "@xstate/react";
import {RouteComponentProps } from "@reach/router";
import { navigate, redirectTo } from "@reach/router"
import { InterpreterFrom } from "xstate";
import {createGigyaAuthMachine} from "../machines/gigyaAuthMachine";

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