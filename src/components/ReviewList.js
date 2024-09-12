import moment from 'moment/moment';
import React, { useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { normalizeFontSize } from '../styles/responsive';
import fonts from '../styles/fonts';
import theme from '../styles/theme';
import { StarRatingDisplay } from 'react-native-star-rating-widget';
import CustomStarIcon from './CustomStarIcon';

const ReviewList = ({ reviews }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };


    const renderItem = ({ item }) => {
        const formattedDate = moment(item.created_at).format('MMMM, YYYY');
        return (
            <View style={styles.reviewContainer}>
                {/* Profile Image */}
                <Image
                    source={{ uri: item?.json_build_object?.profile_image?.url }}
                    style={styles.profileImage}
                />
                <View style={styles.detailsContainer}>
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row' }}>
                            {!item?.is_anonymus && <Text style={styles.username}>
                                {item?.json_build_object?.username || item?.json_build_object?.email}
                            </Text>}
                            <View style={styles.ratingContainer}>
                                <StarRatingDisplay
                                    disable={true}
                                    rating={item?.rating}
                                    maxStars={5}
                                    color={'#ff9900'}
                                    starSize={12}
                                    StarIconComponent={(props) => <CustomStarIcon {...props} />}
                                    style={{
                                        marginTop: 15,
                                        alignSelf: 'center'
                                    }}
                                />
                            </View>
                        </View>
                        <Text style={styles.date}>
                            {formattedDate}
                        </Text>
                    </View>
                    <Text style={styles.comment}>
                        {item?.comment}
                    </Text>
                </View>

            </View>
        );
    };

    return (

        <View style={styles.container}>
            <TouchableOpacity onPress={toggleExpand} style={styles.button}>
                <Text style={styles.buttonText}>
                    {`${reviews?.length || 0} Reviews`}
                </Text>
                <Icon
                    name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={26}
                    color={theme.colors.black}
                />
            </TouchableOpacity>
            {isExpanded && (
                <FlatList
                    data={reviews}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>


    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 10
    },
    listContainer: {
        padding: 10,
    },
    reviewContainer: {
        flexDirection: 'row',
        // padding: 10,
        marginVertical: 8,
        alignItems: 'center',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    detailsContainer: {
        flex: 1,
    },
    header: {
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    username: {
        fontSize: normalizeFontSize(14),
        fontFamily: fonts.fontsType.bold,
        color: theme.colors.lightGrey,
        flex: 1,
        marginTop: 15
    },
    date: {
        fontSize: normalizeFontSize(12),
        fontFamily: fonts.fontsType.medium,
        color: '#888',
    },
    comment: {
        fontSize: normalizeFontSize(14),
        fontFamily: fonts.fontsType.medium,
        color: '#79818B',
    },
    ratingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    rating: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff9900',
    },
    button: {
        backgroundColor: '#C9C9C9',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
        flexDirection: 'row'
    },
    buttonText: {
        color: theme.colors.black,
        fontSize: normalizeFontSize(16),
        fontWeight: fonts.fontsType.bold,
        flex: 1
    },
});

export default ReviewList;
