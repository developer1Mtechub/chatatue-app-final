import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MarkerIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../styles/theme';
import { normalizeFontSize, scaleHeight } from '../styles/responsive';
import fonts from '../styles/fonts';

const AddRouteItem = ({ startLoc, endLoc, onRemove, isPressable = false, isSelected, onSelectionChange, route, setRoute, isRoutePress = false }) => {

  const handlePress = () => {
    if (isPressable) {
      onSelectionChange(!isSelected); // Toggle selection state
    }
  };

  const routePress = () => {
    if (isRoutePress) {
      setRoute(route);
    }
  };

  return (
    <TouchableOpacity
      onPress={() => { routePress(), handlePress() }}
      style={[
        styles.itemContainer,
        {
          borderColor: isSelected ? theme.colors.textHeading : 'transparent',
          borderWidth: isSelected ? 1.5 : 0,
        },
      ]}
      //disabled={!isPressable}
    >
      <View style={{ flexDirection: 'row' }}>
        <View>
          <MarkerIcon name="map-marker" size={24} color={theme.colors.textHeading} />
          <View style={styles.verticalDottedLine} />
          <MarkerIcon name="map-marker" size={24} color={theme.colors.textHeading} />
        </View>

        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} ellipsizeMode='tail' style={styles.itemText}>{startLoc}</Text>
          <View style={styles.horizontalLine} />
          <Text numberOfLines={1} ellipsizeMode='tail' style={[styles.itemText, { top: 15 }]}>{endLoc}</Text>
        </View>
      </View>

      {(
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Icon name="close" size={24} color="black" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: theme.colors.inputBg,
    borderRadius: 10,
    marginTop: scaleHeight(10),
  },
  itemText: {
    fontFamily: fonts.fontsType.medium,
    fontSize: normalizeFontSize(12),
    color: theme.colors.lightGrey,
    flexShrink: 1,
    marginBottom: 8,
    width: '95%',
  },
  removeButton: {
    position: 'absolute',
    padding: 5,
    top: 0,
    right: 0,
  },
  verticalDottedLine: {
    width: 2,
    height: 15,
    backgroundColor: 'transparent',
    borderStyle: 'dotted',
    borderColor: 'white',
    borderWidth: 1,
    alignSelf: 'center',
  },
  horizontalLine: {
    height: 1,
    backgroundColor: theme.colors.primary,
    top: 5,
    width: '92%',
  },
});

export default AddRouteItem;
