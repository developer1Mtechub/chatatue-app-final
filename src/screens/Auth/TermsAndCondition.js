import React, { Component, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { resetNavigation } from '../../utils/resetNavigation';
import { SCREENS } from '../../constant/constants';
import useBackHandler from '../../utils/useBackHandler';
import { getPolicyAndTerms } from '../../redux/AuthSlices/getPolicyTermsSlice';
import { scaleHeight, scaleWidth } from '../../styles/responsive';
import fonts from '../../styles/fonts';
import theme from '../../styles/theme';
import Header from '../../components/Header';
import { termsCondition } from '../../assets/images';

const TermsAndCondition = ({ navigation }) => {
    const dispatch = useDispatch();
    const { response, loading } = useSelector((state) => state.getPolicyAndTerms);

    const handleBackPress = () => {
        resetNavigation(navigation, SCREENS.LOGIN)
        return true;
    };
    useBackHandler(handleBackPress);


    useEffect(() => {
        dispatch(getPolicyAndTerms("TERMS"))
    }, [dispatch])


    const stripHtmlTags = (html) => {
        return html?.replace(/<\/?[^>]+(>|$)/g, "");
    };


    return (
        <SafeAreaView style={styles.container}>
            <Header
                isBackIcon={true}
                onBackPress={handleBackPress}
                title={'Terms & Condition'} />
            <ScrollView style={{
                flex: 1,
                marginHorizontal: 20
            }}>

                <Image style={{
                    width: scaleWidth(152),
                    height: scaleHeight(152),
                    alignSelf: 'center',
                }} source={termsCondition} />

                <Text style={{
                    fontFamily: fonts.fontsType.regular,
                    fontSize: scaleHeight(15),
                    lineHeight: scaleHeight(28),
                    color: theme.colors.labelColors,
                    alignSelf: 'center',
                    textAlign: 'justify'
                }}>
                    {response?.description}
                </Text>

            </ScrollView>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary
    },
});

export default TermsAndCondition;
