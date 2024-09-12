import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import theme from '../styles/theme';
import { normalizeFontSize } from '../styles/responsive';
import fonts from '../styles/fonts';

const CustomDropdown = ({
    apiUrl,
    dataFormatter,
    memberDataFormater,
    placeholder = 'Select',
    searchPlaceholder = 'Search by name...',
    searchEnabled = true,
    onSelect,
    dropdownStyle = {},
    searchTextStyle = {},
    isMember = false
}) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                let formattedItems;
                const response = await axios.get(apiUrl);
                if (!isMember) {
                    const { clubs } = response?.data?.result
                    formattedItems = dataFormatter(clubs);
                } else {
                    const { members } = response?.data?.result
                    formattedItems = memberDataFormater(members);
                }
                setItems(formattedItems);
                setFilteredItems(formattedItems);
            } catch (error) {
                console.error('Error fetching data from API:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiUrl, dataFormatter, memberDataFormater]);

    // Filter items based on search text
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


    return (
        <View style={styles.container}>
            <DropDownPicker
                open={open}
                value={value}
                items={filteredItems}
                setOpen={setOpen}
                setValue={(val) => {
                    setValue(val);
                }}
                onSelectItem={(item) => {
                    onSelect(item)
                }}
                setItems={setItems}
                placeholder={placeholder}
                searchable={searchEnabled}
                searchPlaceholder={searchPlaceholder}
                searchTextInputStyle={[styles.searchInput, searchTextStyle]}
                onChangeSearchText={setSearchText}
                style={[styles.dropdown, dropdownStyle]}
                textStyle={styles.text}
                dropDownContainerStyle={styles.dropdownContainer}
                listMode='SCROLLVIEW'
                tickIconStyle={styles.tickIcon}
                scrollViewProps={{
                    nestedScrollEnabled: true,
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        marginTop: 10
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdown: {
        borderRadius: 30,
        backgroundColor: theme.colors.inputBg,
    },
    searchInput: {
        borderColor: theme.colors.secondary,
        borderWidth: 1,
        borderRadius: 10,
        fontSize: normalizeFontSize(14),
        fontFamily: fonts.fontsType.medium,
        color: theme.colors.labelColors
    },
    text: {
        fontFamily: fonts.fontsType.medium,
        fontSize: normalizeFontSize(16),
        color: theme.colors.white,
        marginHorizontal: 8
    },
    dropdownContainer: {
        backgroundColor: theme.colors.primary,
        elevation: 10,
        shadowOpacity: 0.3
    },
    tickIcon: { backgroundColor: theme.colors.textHeading, borderRadius: 30 }
});

export default CustomDropdown;
