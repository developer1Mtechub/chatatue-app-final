import React, { useState } from 'react';
import { Modal, View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../styles/theme';

const ImageViewer = ({ imageUrl, isVisible, onClose }) => {
    return (
        <Modal transparent visible={isVisible} animationType='none'>
            <View style={styles.modalContainer}>
                <Animatable.View
                    style={styles.imageContainer}
                    animation="bounceIn"
                    duration={800}
                    easing="ease-out"
                >
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Icon name="close" size={30} color="#fff" />
                    </TouchableOpacity>

                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.fullscreenImage}
                    />
                </Animatable.View>
            </View>
        </Modal>
    );
};


const styles = StyleSheet.create({
    thumbnail: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginBottom: 10,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenImage: {
        width: '100%',
        height: '80%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 1,
    },
});

export default ImageViewer;
