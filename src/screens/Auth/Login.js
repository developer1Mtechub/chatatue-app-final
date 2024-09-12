import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated, Platform, Keyboard } from 'react-native';
import CustomLayout from '../../components/CustomLayout';
import CustomTextInput from '../../components/TextInputComponent';
import EmailIcon from 'react-native-vector-icons/Zocial';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import theme from '../../styles/theme';
import Button from '../../components/ButtonComponent';
import fonts from '../../styles/fonts';
import { normalizeFontSize, scaleHeight, scaleWidth } from '../../styles/responsive';
import { resetNavigation } from '../../utils/resetNavigation';
import { SCREENS } from '../../constant/constants';
import FullScreenLoader from '../../components/FullScreenLoader';
import { GmailIcon } from '../../assets/svgs';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/AuthSlices/signInSlice';
import { EMAIL_SIGNIN, GOOGLE_SIGNIN } from '../../constant/signingTypes';
import { signupUser } from '../../redux/AuthSlices/signupSlice';
import { useAlert } from '../../providers/AlertContext';
import { createDelayedNavigation } from '../../utils/navigationWithDelay';
import { setAuthData } from '../../redux/AuthSlices/setDataSlice';
import { getFcmToken } from '../../configs/firebaseConfig';
import { configureGoogleSignin, onGoogleButtonPress } from '../../configs/googleAuth';

const Login = ({ navigation }) => {
    const dispatch = useDispatch();
    const { showAlert } = useAlert();
    const { loading } = useSelector((state) => state.auth)
    const signupLoader = useSelector((state) => state.signup.loading)
    const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState({ email: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const animationValue = useState(new Animated.Value(1))[0];
    const [keyboardStatus, setKeyboardStatus] = useState(false);
    const handleCreateProfile = createDelayedNavigation(navigation, SCREENS.CREATE_PROFILE);
    const [deviceToken, setDeviceToken] = useState(null);
    const [googleSignIn, setGoogleSignIn] = useState(false);

    const handleChange = (name, value) => {
        setForm({ ...form, [name]: value });

        let error = '';
        if (name === 'email') {
            if (value === '') {
                error = 'Email address is required';
            } else if (!validateEmail(value)) {
                error = 'Please enter a valid email address';
            }
        } else if (name === 'password') {
            if (value === '') {
                error = 'Password is required';
            }
        } else if (name === 'confirmPassword' && !isLogin) {
            if (value === '') {
                error = 'Confirm password is required';
            } else if (value !== form.password) {
                error = 'Passwords do not match';
            }
        }
        setErrors({ ...errors, [name]: error });
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    useEffect(() => {
        getFcmToken().then(token => {
            setDeviceToken(token)
        });
    }, []);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardStatus(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardStatus(false);
            }
        );
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        configureGoogleSignin();
    }, [])

    const handleAuthAction = () => {
        const { email, password, confirmPassword } = form;
        let valid = true;
        let newErrors = { email: '', password: '', confirmPassword: '' };

        if (email === '') {
            newErrors.email = 'Email address is required';
            valid = false;
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
            valid = false;
        }

        if (password === '') {
            newErrors.password = 'Password is required';
            valid = false;
        }

        // else if (!validatePassword(password)) {
        //     newErrors.password = 'Password must be at least 6 characters long';
        //     valid = false;
        // }

        if (!isLogin && (confirmPassword === '' || confirmPassword !== password)) {
            newErrors.confirmPassword = confirmPassword === '' ? 'Confirm password is required' : 'Passwords do not match';
            valid = false;
        }

        setErrors(newErrors);

        if (valid) {
            if (isLogin) {
                const loginCredentials = {
                    email: email,
                    password: password,
                    device_id: deviceToken,
                    signup_type: EMAIL_SIGNIN
                }

                dispatch(login(loginCredentials)).then((result) => {
                    if (result?.payload?.success === true) {
                        showAlert("Success", "success", "Logged In successfully.")
                    } else {
                        showAlert("Error", "error", result?.payload?.message)
                    }

                })
            } else {

                const signupCredentials = {
                    email: email,
                    password: password,
                    device_id: deviceToken,
                    signup_type: EMAIL_SIGNIN
                    // apple_access_token: "apl8999873928479",
                    // google_access_token: "google08902384098092830"
                }

                dispatch(signupUser(signupCredentials)).then((result) => {
                    if (result?.payload?.success === true) {
                        dispatch(setAuthData({
                            email: email,
                            password: password,
                            signup_type: EMAIL_SIGNIN
                        }))
                        showAlert("Success", "success", "User created successfully.")
                        handleCreateProfile();
                    } else if (result?.payload?.success === false) {
                        showAlert("Error", "error", result?.payload?.message)
                    }

                })

            }
        }
    };

    const handleForgetPass = () => {
        resetNavigation(navigation, SCREENS.FORGET_PASSWORD)
    }

    const toggleAuthMode = () => {
        setForm({ email: '', password: '', confirmPassword: '' })
        setErrors({ email: '', password: '', confirmPassword: '' })
        Animated.timing(animationValue, {
            toValue: 0.5,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsLogin(!isLogin);
            Animated.timing(animationValue, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });
    };


    const directGoogleSignUpAndSignIn = (email, googleToken) => {

        const signupCredentials = {
            email: email,
            //password: password,
            device_id: deviceToken,
            signup_type: GOOGLE_SIGNIN,
            google_access_token: googleToken,
        }

        dispatch(signupUser(signupCredentials)).then((result) => {
            if (result?.payload?.success === true) {
                dispatch(setAuthData({
                    email: email,
                    //password: password,
                    signup_type: GOOGLE_SIGNIN,
                    isGoogleAuth: true,
                    google_access_token: googleToken
                }))
                showAlert("Success", "success", "User created successfully.")
                handleCreateProfile();
            } else if (result?.payload?.success === false) {
                showAlert("Error", "error", result?.payload?.message)
            }

        })

    }

    async function handleGoogleSignIn() {
        setGoogleSignIn(true)
        try {
            const result = await onGoogleButtonPress();
            if (result.user && result.idToken) {

                var googleToken = result?.idToken;
                var email = result.user?.email;

                if (isLogin) {
                    const credentials = {
                        email: result?.user?.email,
                        device_id: deviceToken,
                        signup_type: GOOGLE_SIGNIN,
                        google_access_token: googleToken
                    }
                    dispatch(login(credentials)).then((result) => {
                        setGoogleSignIn(false)
                        if (result?.payload?.success === true) {
                            showAlert("Success", "success", result?.payload?.message)
                        } else {
                            //showAlert("Error", "error", result?.payload?.message)
                            directGoogleSignUpAndSignIn(email, googleToken)
                        }

                    })

                } else {
                    const signupCredentials = {
                        email: email,
                        //password: password,
                        device_id: deviceToken,
                        signup_type: GOOGLE_SIGNIN,
                        google_access_token: googleToken,
                    }

                    dispatch(signupUser(signupCredentials)).then((result) => {
                        if (result?.payload?.success === true) {
                            dispatch(setAuthData({
                                email: email,
                                //password: password,
                                signup_type: GOOGLE_SIGNIN,
                                isGoogleAuth: true,
                                google_access_token: googleToken
                            }))
                            showAlert("Success", "success", "User created successfully.")
                            handleCreateProfile();
                        } else if (result?.payload?.success === false) {
                            showAlert("Error", "error", result?.payload?.message)
                        }

                    })
                }
            } else {
                console.error('Sign-In failed: No user or token returned');
            }
        } catch (error) {
            console.error('Sign-In Error:', error);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <CustomLayout>
                <View style={styles.contentContainer}>
                    <Text style={styles.welcomeText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
                    <Text style={styles.subTitle}>{isLogin ? 'Please login to your account.' : 'Create a new account.'}</Text>
                    <CustomTextInput
                        placeholder={'Email Address'}
                        identifier={'email'}
                        value={form.email}
                        onValueChange={(value) => handleChange('email', value)}
                        mainContainer={{ marginTop: 20 }}
                        iconComponent={<EmailIcon style={{ marginHorizontal: 15 }} name="email" size={20} color={theme.colors.lightGrey} />}
                    // leftIcon={<EmailIcon style={{ marginHorizontal: 15 }} name="email" size={20} color={theme.colors.lightGrey} />}
                    />
                    {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                    <CustomTextInput
                        placeholder={'Password'}
                        identifier={'password'}
                        value={form.password}
                        secureTextEntry={!showPassword}
                        onValueChange={(value) => handleChange('password', value)}
                        // leftIcon={<MaterialCommunityIcons style={{ marginHorizontal: 15 }} name="lock" size={20} color={theme.colors.lightGrey} />}
                        mainContainer={{ marginTop: 15 }}
                        iconComponent={
                            <MaterialCommunityIcons
                                onPress={() => { setShowPassword(!showPassword) }}
                                style={{ marginEnd: 8 }}
                                name={!showPassword ? "lock" : "lock-open"} size={24}
                                color={theme.colors.lightGrey} />
                        }
                    />
                    {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                    {!isLogin && (
                        <CustomTextInput
                            placeholder={'Confirm Password'}
                            identifier={'confirmPassword'}
                            value={form.confirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            onValueChange={(value) => handleChange('confirmPassword', value)}
                            // leftIcon={<MaterialCommunityIcons style={{ marginHorizontal: 15 }} name="lock" size={20} color={theme.colors.lightGrey} />}
                            mainContainer={{ marginTop: 15 }}
                            iconComponent={
                                <MaterialCommunityIcons
                                    onPress={() => { setShowConfirmPassword(!showConfirmPassword) }}
                                    style={{ marginEnd: 8 }}
                                    name={!showConfirmPassword ? "lock" : "lock-open"} size={24}
                                    color={theme.colors.lightGrey} />
                            }
                        />
                    )}
                    {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

                    <Button
                        loading={isLogin && !googleSignIn ? loading : signupLoader}
                        onPress={handleAuthAction}
                        title={isLogin ? 'Sign In' : 'Create'}
                        customStyle={{ width: '100%', marginBottom: 20, marginTop: 30 }}
                    />
                    {isLogin && (
                        <View style={styles.forgetPassContainer}>
                            <TouchableOpacity onPress={() => { handleForgetPass() }}>
                                <Text style={styles.forgetText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={{
                        alignSelf: 'center',
                        marginTop: scaleHeight(60),
                        alignItems: 'center'
                    }}>
                        <Text style={[styles.createAccountText1,]}>or {isLogin ? 'Login' : 'Sign up'} with</Text>
                        <View style={{
                            flexDirection: 'row',
                            marginTop: 10,
                        }}>

                            {Platform.OS === 'android' ? <TouchableOpacity
                                onPress={() => { handleGoogleSignIn() }}
                                style={styles.appleButton}>
                                {<AntDesign name='google' size={28} color={theme.colors.black} />}
                            </TouchableOpacity> :
                                <TouchableOpacity style={styles.appleButton}>
                                    <AntDesign name='apple1' size={28} color={theme.colors.black} />
                                </TouchableOpacity>}

                        </View>
                    </View>
                </View>

                <View>

                </View>

                <View style={{ marginTop: '10%', marginBottom: 10 }}>
                    <View style={styles.createAccountItem}>
                        <Text style={styles.createAccountText1}>{isLogin ? 'Don’t have an account?' : 'Already have an account?'}</Text>
                        <TouchableOpacity onPress={toggleAuthMode} >
                            <Text style={styles.createAccountText2}>{isLogin ? 'Create new now!' : 'Login Now'}</Text>
                        </TouchableOpacity>

                    </View>
                    <View style={[styles.createAccountItem, { width: '97%', flexDirection: 'column', }]}>
                        <Text style={[styles.createAccountText1, { alignSelf: 'center' }]}>By {isLogin ? 'logging in' : 'signing up'}, you are agree with our</Text>
                        <TouchableOpacity
                            onPress={() => {
                                resetNavigation(navigation, SCREENS.TERM_CONDITION)
                            }}
                        >
                            <Text style={[styles.createAccountText2, { alignSelf: 'center', marginTop: 5 }]}>Terms & Conditions</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </CustomLayout>

            {/* {!keyboardStatus && <View style={{ marginBottom: scaleHeight(30), }}>
                <View style={styles.createAccountItem}>
                    <Text style={styles.createAccountText1}>{isLogin ? 'Don’t have an account?' : 'Already have an account?'}</Text>
                    <TouchableOpacity onPress={toggleAuthMode} >
                        <Text style={styles.createAccountText2}>{isLogin ? 'Create new now!' : 'Login Now'}</Text>
                    </TouchableOpacity>

                </View>
                <View style={[styles.createAccountItem, { width: '97%', flexDirection: 'column', }]}>
                    <Text style={[styles.createAccountText1, { alignSelf: 'center' }]}>By {isLogin ? 'logging in' : 'signing up'}, you are agree with our</Text>
                    <TouchableOpacity
                        onPress={() => {
                            resetNavigation(navigation, SCREENS.TERM_CONDITION)
                        }}
                    >
                        <Text style={[styles.createAccountText2, { alignSelf: 'center', marginTop: 5 }]}>Terms & Conditions</Text>
                    </TouchableOpacity>
                </View>
            </View>} */}

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary,
    },
    contentContainer: {
        padding: 25,
        flex: 1,
        marginTop: scaleHeight(20)
    },
    welcomeText: {
        fontFamily: fonts.fontsType.bold,
        fontSize: normalizeFontSize(36),
        color: theme.colors.textHeading,
        marginTop: 15,
    },
    subTitle: {
        fontFamily: fonts.fontsType.bold,
        fontSize: normalizeFontSize(18),
        color: theme.colors.white,
        marginTop: 5,
    },
    forgetText: {
        fontFamily: fonts.fontsType.bold,
        fontSize: normalizeFontSize(14),
        color: theme.colors.white,
        alignSelf: 'flex-end',
    },
    createAccountText1: {
        fontFamily: fonts.fontsType.bold,
        fontSize: normalizeFontSize(12),
        color: theme.colors.labelColors,
        alignSelf: 'center'
    },
    createAccountText2: {
        fontFamily: fonts.fontsType.bold,
        fontSize: normalizeFontSize(14),
        color: theme.colors.secondary,
        marginHorizontal: 5,
        textDecorationLine: 'underline',
    },
    createAccountItem: {
        flexDirection: 'row',
        alignSelf: 'center',
        marginTop: 20,
    },
    createAccountView: {
        flex: 1,
    },
    forgetPassContainer: {
        flexDirection: 'row',
        flex: 1,
        alignSelf: 'flex-end',
        marginEnd: scaleWidth(10),
    },
    backButton: {
        paddingHorizontal: 25,
        marginTop: 20,
    },
    errorText: {
        fontFamily: fonts.fontsType.regular,
        fontSize: normalizeFontSize(12),
        color: theme.colors.error,
        marginTop: 5,
        alignSelf: 'flex-start',
    },
    appleButton: {
        backgroundColor: theme.colors.white,
        height: 50,
        width: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    googleButton: {
        marginHorizontal: 8,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default Login;
