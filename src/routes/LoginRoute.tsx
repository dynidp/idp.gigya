import {AuthService} from "../machines/authMachine";
import SignUp from "../components/SignUp";
import SignIn from "../components/SignIn";
import { useActor } from "@xstate/react";
import {RouteProps} from "./PrivateRoute";

export function LoginRoute({authService, ...props}: RouteProps) {
    const [state] = useActor(authService)
    switch (true) {
        case state.matches('login.signup'):
            return <SignUp {...props} authService={authService}/>
        default:
            return <SignIn {...props} authService={authService}/>
    }


}