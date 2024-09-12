import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Dimensions, Keyboard } from 'react-native';
import axios from 'axios';
import BottomSheet from 'react-native-raw-bottom-sheet';
import theme from '../styles/theme';
import { normalizeFontSize } from '../styles/responsive';
import fonts from '../styles/fonts';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Button from './ButtonComponent';

const { height } = Dimensions.get('window');

const ListBottomSheet = ({
    apiUrl,
    dataFormatter,
    memberDataFormater,
    placeholder = '',
    searchEnabled = true,
    onSelect,
    dropdownStyle = {},
    searchTextStyle = {},
    isMember = false
}) => {
    const [selectedMembers, setSelectedMembers] = useState(isMember ? [] : null);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchText, setSearchText] = useState('');
    const bottomSheetRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let formattedItems;
                const response = await axios.get(apiUrl);
                if (response?.data?.result) {
                    if (!isMember) {
                        const { clubs } = response?.data?.result || [];
                        console.log('clubs', clubs)
                        formattedItems = dataFormatter(clubs);
                    } else {
                        const { members } = response?.data?.result || [];
                        formattedItems = memberDataFormater(members);
                    }
                }

                setItems(formattedItems);
                setFilteredItems(formattedItems);
            } catch (error) {
                console.log('Error fetching data from API:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiUrl, dataFormatter, memberDataFormater]);

    useEffect(() => {
        if (searchText) {
            const filtered = items.filter((item) =>
                item?.label.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredItems(filtered);
        } else {
            setFilteredItems(items);
        }
    }, [searchText, items]);


    const handleMemberSelect = (item) => {
        if (isMember) {
            const isSelected = selectedMembers.some(member => member.value === item.value);
            let updatedSelectedMembers;
            if (isSelected) {
                updatedSelectedMembers = selectedMembers.filter(member => member.value !== item.value); // Deselect if already selected
            } else {
                updatedSelectedMembers = [...selectedMembers, item]; // Select new member
            }
            setSelectedMembers(updatedSelectedMembers);
            onSelect(updatedSelectedMembers); // Pass updated selection to parent
        } else {
            setSelectedMembers(item); // For single selection
            onSelect(item);
            bottomSheetRef.current?.close(); // Close after selection in single mode
        }
    };

    const renderItem = ({ item }) => {
        const isSelected = isMember && selectedMembers.some(member => member.value === item.value);
        return (
            <TouchableOpacity
                style={[styles.item, isSelected && { backgroundColor: theme.colors.selectedItem }]}
                onPress={() => handleMemberSelect(item)}
            >
                <Text style={styles.itemText}>{item.label}</Text>
                {isSelected && <AntDesign name="checkcircle" size={20} color={theme.colors.textHeading} />}
            </TouchableOpacity>
        );
    };

    // const renderItem = ({ item }) => (
    //     <TouchableOpacity style={styles.item} onPress={() => {
    //         onSelect(item)
    //         setValue(item?.label)
    //         bottomSheetRef.current?.close()
    //     }}>
    //         <Text style={styles.itemText}>{item.label}</Text>
    //     </TouchableOpacity>
    // );

    const renderSelectedValue = () => {
        if (isMember) {
            if (selectedMembers.length === 0) return placeholder;
            return selectedMembers.map(member => member.label).join(', ');
        } else {
            return selectedMembers ? selectedMembers.label : placeholder;
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => {
                Keyboard.dismiss();
                bottomSheetRef.current?.open()

            }} style={styles.placeholderButton}>
                <Text style={styles.placeholderText}>
                    {/* {value ? value : placeholder} */}
                    {renderSelectedValue()}
                </Text>
                <AntDesign name="down" size={18} color={theme.colors.labelColors} />
            </TouchableOpacity>

            <BottomSheet
                ref={bottomSheetRef}
                height={height / 2}
                openDuration={250}
                customStyles={{
                    wrapper: styles.wrapperStyle,
                    container: styles.bottomSheetContainer,
                }}
            >
                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={filteredItems}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.value.toString()}
                        style={styles.flatList}
                    />
                )}

                {isMember && <Button
                    onPress={() => {
                        bottomSheetRef.current?.close()
                    }}
                    title={'Done'}
                    customStyle={{ width: '70%', marginBottom: 15 }} />}
            </BottomSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        marginTop: 10,
    },
    placeholderButton: {
        backgroundColor: theme.colors.inputBg,
        borderRadius: 30,
        height: 45,
        justifyContent: 'center',
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    placeholderText: {
        fontSize: normalizeFontSize(16),
        color: theme.colors.white,
        fontFamily: fonts.fontsType.medium,
        flex: 1
    },
    bottomSheetContainer: {
        backgroundColor: theme.colors.primary,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    flatList: {
        flex: 1,
    },
    item: {
        padding: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: theme.colors.secondary,
    },
    itemText: {
        fontSize: normalizeFontSize(16),
        color: theme.colors.white,
        fontFamily: fonts.fontsType.medium,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    draggableIcon: {
        backgroundColor: '#000',
        width: 50,
        height: 5,
        borderRadius: 5,
        alignSelf: 'center',
        marginVertical: 10,
    },
    wrapperStyle: {
        backgroundColor: theme.colors.backDropColor
    }
});

export default ListBottomSheet;
