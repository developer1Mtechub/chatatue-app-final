import React, { useRef, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import theme from '../../styles/theme';
import { normalizeFontSize, scaleHeight, scaleWidth } from '../../styles/responsive';
import fonts from '../../styles/fonts';
import Button from '../../components/ButtonComponent';
import Icon from 'react-native-vector-icons/EvilIcons';
import { onboardingImg1, onboardingImg2, onboardingImg3 } from '../../assets/images';
import { resetNavigation } from '../../utils/resetNavigation';
import { SCREENS } from '../../constant/constants';
import { useDispatch } from 'react-redux';
import { setFirstLaunch } from '../../redux/AuthSlices/isFirstLaunchSlice';
import Swiper from 'react-native-swiper';

const Onboarding = ({ navigation }) => {
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(0);
    const swiperRef = useRef(null);

    const pages = [
        {
            image: onboardingImg1,
            title: 'Discover Clubs and Events',
            subtitle: 'Explore clubs and events that match your interests. Join a community of runners and stay motivated with group runs and competitions',
        },
        {
            image: onboardingImg2,
            title: 'Engage with the Community',
            subtitle: 'Share your achievements, post updates, and interact with other runners. Your journey is better with friends.',
        },
        {
            image: onboardingImg3,
            title: 'Engage with Friends',
            subtitle: 'Connect with friends, join group runs, and share your experiences. Together, we can push each other to achieve more.',
        },
    ];

    const handleSkip = () => {
        resetNavigation(navigation, SCREENS.LOGIN)
        dispatch(setFirstLaunch(false))
    };

    const handleNext = () => {
        if (currentPage < pages.length) {
            swiperRef.current.scrollBy(1);
            setCurrentPage(currentPage + 1);
        } else {
            handleSkip();
            console.log('Hello this is end..')
        }
    };

    const onIndexChanged = (index) => {
        setCurrentPage(index);
    };

    return (
        <View style={[styles.container,]}>
            <Swiper
                ref={swiperRef}
                loop={false}
                showsPagination={true}
                activeDotColor={theme.colors.textHeading}
                dotColor={theme.colors.white}
                paginationStyle={{
                    bottom: scaleHeight(120),
                }}
                bounces={true}
                onIndexChanged={onIndexChanged}
            >
                {pages.map((page, index) => (
                    <View key={index} style={styles.slide}>
                        <Image source={page.image} style={styles.image} />
                        <Text style={styles.title}>{page.title}</Text>
                        <Text style={styles.subtitle}>{page.subtitle}</Text>
                    </View>
                ))}
            </Swiper>
            {/* <Image source={pages[currentPage].image} style={styles.image} />
            <Text style={styles.title}>{pages[currentPage].title}</Text>
            <Text style={styles.subtitle}>{pages[currentPage].subtitle}</Text>
            <View style={styles.indicatorContainer}>
                {pages.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            { backgroundColor: index === currentPage ? 'gold' : 'white' },
                        ]}
                    />
                ))}
            </View> */}
            {/* <Icon name='location' size={45} color={theme.colors.textHeading} style={[styles.locationIcon]} /> */}
            <Button
                onPress={handleSkip}
                title={'Skip'}
                customStyle={styles.skipButton}
                textCustomStyle={{ color: theme.colors.black }}
            />
            <Button
                onPress={handleNext}
                title={currentPage < pages.length - 1 ? 'NEXT' : 'START'}
                customStyle={styles.nextButton}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.primary,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    image: {
        width: scaleWidth(300),
        height: scaleHeight(300),
        marginBottom: 20,
        borderRadius: 30
    },
    title: {
        width: '80%',
        fontSize: normalizeFontSize(26),
        fontWeight: fonts.fontsType.bold,
        marginBottom: 10,
        color: theme.colors.white,
        textAlign: 'center'
    },
    subtitle: {
        fontSize: normalizeFontSize(12),
        fontWeight: fonts.fontsType.regular,
        textAlign: 'center',
        marginBottom: 40,
        color: theme.colors.focusedPlaceholder
    },
    indicatorContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    indicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    skipButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: theme.colors.textHeading,
        width: '20%',
        height: scaleHeight(30),
        borderRadius: 10,
    },
    locationIcon: {
        position: 'absolute',
        top: 35,
        left: 20,
        alignSelf: 'center',
        bottom: 8
    },
    skipButtonText: {
        fontSize: 16,
    },
    nextButton: {
        position: 'absolute',
        bottom: 20,
    },
    nextButtonText: {
        fontSize: 16,
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

});

export default Onboarding;
