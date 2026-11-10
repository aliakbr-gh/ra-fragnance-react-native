import { Dimensions, PixelRatio } from 'react-native';

/** Percentage of the current window width, rounded to a whole pixel. */
export function wp(percent: number) {
  return PixelRatio.roundToNearestPixel((Dimensions.get('window').width * percent) / 100);
}

/** Percentage of the current window height, rounded to a whole pixel. */
export function hp(percent: number) {
  return PixelRatio.roundToNearestPixel((Dimensions.get('window').height * percent) / 100);
}
