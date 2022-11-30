// import logo from "./logo.svg";
import React, {useEffect} from "react";
import "./App.css";
import "./styles/globals.css";
import SignIn from "./components/SignIn";
import {authMachine, AuthService} from "./machines/authMachine";
import {createHistory, createMemorySource, LocationProvider, RouteComponentProps, Router} from "@reach/router";
import {useMachine} from "@xstate/react";
import {AnyState} from "xstate";
import {Box, Container} from "@mui/material";
import {SnackbarContext, snackbarMachine} from "./machines/snackbarMachine";
import AlertBar from "./components/AlertBar";
import {notificationMachine} from "./machines/notificationsMachine";
import NotificationsContainer from "./containers/NotificationsContainer";
import ProfileContainer from "./containers/ProfileContainer";
import EventsContainer from "./containers/ActionsContainer";
import {useInterpretWithLocalStorage} from "./machines/withLocalStorage";
import {PrivateRoute} from "./routes";
import {navigate, useLocation} from "@reach/router"

import {ThemeProvider, Theme, StyledEngineProvider, createTheme} from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import SignInOidc from "./components/SignInOidc";
import {AuthContext, AuthProvider} from "./containers/AuthContainer";
import {Stack} from "@mui/material";
import {useContext} from "react";


declare module '@mui/styles/defaultTheme' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DefaultTheme extends Theme {
    }
}


const theme = createTheme();

const useStyles = makeStyles((theme) => {
    root: {
        // some CSS that accesses the theme
    }
});

export interface AppProperties extends RouteComponentProps{
    tab?: string
}

const App = (props: AppProperties) => {

// for some types of tests you want a memory source
//     let source = createMemorySource("/starting/url")
    //let history = createHistory(source)

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                    <AuthProvider>
                        <AppWithService/>
                    </AuthProvider>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

const AppWithService = () => {
    const authService = useContext(AuthContext);
    const [, sendSnackbar, snackbarService] = useMachine(snackbarMachine);
    const [, sendNotification, notificationService] = useMachine(notificationMachine);

    const showSnackbar = (payload: SnackbarContext) => sendSnackbar({type: "SHOW", ...payload});

    useEffect(() => {
        if (authService) {
            const subscription = authService.subscribe((state: AnyState) => {
                // simple state logging
                console.log(state);
                showSnackbar({message: state.value.toString(), severity: "info"})

            });
            return subscription.unsubscribe;

        }
        return () => {
        };

    }, [authService]);

    if (authService) {


        return (<div>
            <EventsContainer authService={authService} notificationsService={notificationService}/>

            <Box>
                <Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="stretch"
                    spacing={0.5}
                >
                    <Container>
                        <Router>
                            <PrivateRoute default as={ProfileContainer} path={"/"}
                                          authService={authService}
                                          notificationsService={notificationService}
                            />
                            <SignIn path={"/signin"} authService={authService}
                                    notificationsService={notificationService}/>
                            <ProfileContainer path="/profile" authService={authService}
                                              notificationsService={notificationService}/>
                        </Router>

                    </Container>

                    <Container maxWidth="sm">
                        <NotificationsContainer authService={authService}
                                                notificationsService={notificationService}/>
                    </Container>
                </Stack>

            </Box>

            <AlertBar snackbarService={snackbarService}/>

        </div>)
    } else {
        return <div>loading..</div>
    }
}

export default App;
