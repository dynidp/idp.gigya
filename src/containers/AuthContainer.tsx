import React, {useEffect, useState, createContext, useContext} from "react";
import {authMachine, AuthService, AuthMachineContext, AuthMachine} from "../machines/authMachine";
import {useInterpret} from "@xstate/react";
import {RouteComponentProps } from "@reach/router";
import { navigate } from "@reach/router"
import { InterpreterFrom } from "xstate";
import {useInterpretWithLocalStorage} from "../machines/withLocalStorage";
import {withGigya} from "../machines/withGigya";

export const AuthContext = createContext<InterpreterFrom<AuthMachine>>({} as InterpreterFrom<AuthMachine>);
export type AuthProviderProps = RouteComponentProps

function OAuthProvider({ children}:React.PropsWithChildren) {

    const authService = useInterpret(() => withGigya(authMachine, {navigate, location }));
 
    return  <AuthContext.Provider value={authService}>
        {children}
    </AuthContext.Provider>
}
export const AuthProvider =OAuthProvider;