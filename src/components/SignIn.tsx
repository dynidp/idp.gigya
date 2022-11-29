import React from "react";
import {RouteComponentProps} from "@reach/router"

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import makeStyles from '@mui/styles/makeStyles';
import Container from "@mui/material/Container";
import {useForm} from "react-hook-form";
import {useSelector} from "@xstate/react";
import {AuthService} from "../machines/authMachine";
import {ErrorOutlined} from "@mui/icons-material";
import {Google, WindowTwoTone} from "@mui/icons-material";
import {RouteProps} from "../routes/PrivateRoute";

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: theme.spacing(1)
    },
    paperRow: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        margin: theme.spacing(1)
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(2, 0, 2),
    },
}));

export interface SignInProps extends RouteProps {
}

const loginServiceSelector = (state: any) => state.context;
export default function SignIn({authService}: SignInProps) {
    const classes = useStyles();
    const {register, handleSubmit, formState: {errors}} = useForm();
    const {message} = useSelector(authService, loginServiceSelector);

    // const {loginService} = useSelector(authService, loginServiceSelector);
    const loginService = authService;

    // const [ state,sendAuth] = useActor(authService.state);
    // The normal Gigya account login process makes use of
    // the react-hook-form library
    const handleLogin = async (data: any) => {
        const params = {
            email: data.email,
            password: data.password,
        };
        loginService.send({type: "SUBMIT", ...params})

    };
    const handleRegister = async () => {
       
        loginService.send({type: "SIGNUP"})

    };

    const handleFacebookGigyaLogin = () => {
        loginService.send({type: 'SOCIAL', provider: "facebook"});
    };

    const handleMicrosoftGigyaLogin = () => {
        loginService.send({type: 'SOCIAL', provider: "microsoft"});
    };
    
    const handleLinkedinGigyaLogin = () => {
        loginService.send({type: 'SOCIAL', provider: "linkedin"});
    };


    const handleGoogleLogin = () => {
        loginService.send({type: 'SOCIAL', provider: "google"});
    };

    const handleOConnectLogin = async () => {
        loginService.send({type: 'SOCIAL', provider: "oidc-logindynidp"});
    };

    const handleOPublicConnectGigyaLogin = () => {
        loginService.send({type: 'SOCIAL', provider: "oidc-logindynidpeu"});
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline/>
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon/>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <form
                        className={classes.form}
                        noValidate
                        onSubmit={handleSubmit(handleLogin)}
                    >
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            autoComplete="email"
                            autoFocus
                            {...register("email", {required: true})}
                        />
                        {errors && errors.email && <span>Please enter an Email address</span>}
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            {...register("password", {required: true})}
                        />
                        {errors && errors.password && <span>Please enter a password</span>}
                        <Button
                            type="submit"
                            fullWidth
                            
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Sign In
                        </Button>

                    
                    </form>


                </div>
            
            

            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                startIcon ={<WindowTwoTone />}

                className={classes.submit}
                onClick={handleMicrosoftGigyaLogin}
            >
                Sign In With Microsoft
            </Button>
            
            {/*<Button*/}
            {/*    type="submit"*/}
            {/*    fullWidth*/}
            {/*    variant="contained"*/}
            {/*    color="primary"*/}
            {/*    className={classes.submit}*/}
            {/*    onClick={handleFacebookGigyaLogin}*/}
            {/*>*/}
            {/*    Sign In With Facebook*/}
            {/*</Button>*/}
            

            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleGoogleLogin}                
                startIcon ={<Google /> }


            >
                Sign In With Google
            </Button>

            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleOConnectLogin}
            >
                Sign In With OIDC Connect (logindynidp)
            </Button>
            
            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleOPublicConnectGigyaLogin}
            >
                Sign In OIDC Provider (logindynidp/eu)
            </Button>

       
            <Grid container justifyContent="flex-start">
                <Grid item>
                    <Link  onClick={handleRegister} variant="body2">
                        {"Don't have an account? Sign Up"}
                    </Link>
                </Grid>
            </Grid>

            {message &&  <span><ErrorOutlined /> {message}</span>}

        </Container>
    );
}
