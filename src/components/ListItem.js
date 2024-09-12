import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import FullScreenLoader from './FullScreenLoader';
import fonts from '../styles/fonts';
import { normalizeFontSize, scaleHeight, scaleWidth } from '../styles/responsive';
import theme from '../styles/theme';

const ListItem = ({ item, index, isGridView, handleItemPress, isTag = false }) => {
    const [imageLoading, setImageLoading] = useState(true);

    const renderItem = useCallback(({ item, index }) => {
        const imageHeight = isGridView ? scaleHeight(160) : scaleHeight(240);
        const containerWidth = isGridView ? scaleWidth(160) : '95%';
        const isPublic = item?.is_public;
        const tagColor = isPublic ? theme.colors.success : theme.colors.tagColor;
        const tagLabel = isPublic ? 'Public' : 'Private';
        const itemImageUrl = item?.details?.images[0]?.url || item?.images[0]?.url || ''; // Fallback URL if needed

        const handleImageLoadStart = () => {
            setImageLoading(true);
        };

        const handleImageLoadEnd = () => {
            setImageLoading(false);
        };

        return (
            <View style={[styles.itemContainer, { flex: isGridView ? 0 : 1, width: containerWidth }]}>
                <TouchableOpacity
                    style={{ height: imageHeight }}
                    onPress={() => handleItemPress(item?.id)}
                >
                    {imageLoading && (
                        <FullScreenLoader
                            indicatorSize={40}
                            customIndicatorContainer={styles.loader}
                            loading={imageLoading}
                        />
                    )}

                    <FastImage
                        source={{ uri: itemImageUrl, priority: FastImage.priority.high }}
                        style={styles.image}
                        resizeMode={FastImage.resizeMode.cover}
                        onLoadStart={handleImageLoadStart}
                        onLoadEnd={handleImageLoadEnd}
                    />
                </TouchableOpacity>

                {isTag && <View style={[styles.tagStyle, { backgroundColor: tagColor, top: isGridView ? '50%' : '62%', }]}>
                    <Text style={styles.tagLabel}>{tagLabel}</Text>
                </View>}

                <View style={{ flexDirection: 'row' }}>
                    <Text numberOfLines={1} ellipsizeMode='tail' style={styles.name}>{item?.name || item?.title || item?.details?.name}</Text>

                </View>

                <Text numberOfLines={2} ellipsizeMode='tail' style={styles.description}>
                    {item?.description || item?.details?.description}
                </Text>
            </View>
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return renderItem({ item, index });
};

const styles = StyleSheet.create({
    itemContainer: {
        width: scaleWidth(160),
        flex: 1,
        margin: 10,
        borderRadius: 16,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        alignSelf: 'center',
        resizeMode: 'contain'
    },
    name: {
        fontFamily: fonts.fontsType.semiBold,
        fontSize: scaleHeight(14),
        color: theme.colors.white,
        marginTop: 5,
        flex: 1,
        alignSelf: 'center',
    },
    rating: {
        fontFamily: fonts.fontsType.regular,
        fontSize: scaleHeight(12),
        color: theme.colors.labelColors,
        marginTop: 8,
        marginEnd: 10,
        alignSelf: 'center',
        marginHorizontal: 2
    },
    description: {
        fontFamily: fonts.fontsType.medium,
        fontSize: scaleHeight(12),
        color: theme.colors.labelColors,
    },
    listContainer: {
        alignItems: 'center',
    },
    gridContainer: {
        justifyContent: 'space-between',
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    tagStyle: {
        borderRadius: 10,
        padding: 8,
        position: 'absolute',
        // top: scaleHeight(110),
        // top:'50%',
        right: 10,
    },
    tagLabel: {
        fontFamily: fonts.fontsType.medium,
        fontSize: normalizeFontSize(12),
        color: theme.colors.white
    },
    loader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -25 }, { translateY: -25 }],
        backgroundColor: theme.colors.transparent
    }
});

export default React.memo(ListItem);


