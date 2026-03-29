/**
 * NativeWind v5 Interop Configuration
 * 
 * This file configures cssInterop for Expo components to support className prop
 * with Tailwind CSS utility classes via NativeWind v5.
 */

import { Platform } from 'react-native';

// Import cssInterop from nativewind - handle potential import issues
let cssInterop: any;
try {
  const nativewind = require('nativewind');
  cssInterop = nativewind.cssInterop;
} catch (e) {
  console.log('NativeWind cssInterop not available');
}

/**
 * Configure cssInterop for Expo components
 * This enables className prop support for NativeWind v5
 */

// Only configure cssInterop on native platforms
// Web doesn't need cssInterop as it uses standard CSS
if (Platform.OS !== 'web') {
  // BlurView - Glassmorphism effects
  try {
    const { BlurView } = require('expo-blur');
    cssInterop(BlurView, {
      className: 'style',
    });
  } catch (e) {
    console.log('BlurView not available');
  }

  // LinearGradient - Gradient backgrounds
  try {
    const { LinearGradient } = require('expo-linear-gradient');
    cssInterop(LinearGradient, {
      className: 'style',
    });
  } catch (e) {
    console.log('LinearGradient not available');
  }

  // MeshGradient - Dynamic mesh backgrounds
  try {
    const { MeshGradient } = require('expo-mesh-gradient');
    cssInterop(MeshGradient, {
      className: 'style',
    });
  } catch (e) {
    console.log('MeshGradient not available');
  }

  // SymbolView - SF Symbols / Material Symbols
  // Maps className to style and tintColor
  try {
    const { SymbolView } = require('expo-symbols');
    cssInterop(SymbolView, {
      className: {
        target: 'style',
        nativeStyleToProp: {
          color: 'tintColor',
        },
      },
    });
  } catch (e) {
    console.log('SymbolView not available');
  }
}

// Export components for use in other files - only on native platforms
// Web uses standard CSS alternatives
export let BlurView: any = null;
export let LinearGradient: any = null;
export let MeshGradient: any = null;
export let SymbolView: any = null;

if (Platform.OS !== 'web') {
  try {
    const blur = require('expo-blur');
    BlurView = blur.BlurView;
  } catch (e) {
    console.log('BlurView not available');
  }
  
  try {
    const gradient = require('expo-linear-gradient');
    LinearGradient = gradient.LinearGradient;
  } catch (e) {
    console.log('LinearGradient not available');
  }
  
  try {
    const mesh = require('expo-mesh-gradient');
    MeshGradient = mesh.MeshGradient;
  } catch (e) {
    console.log('MeshGradient not available');
  }
  
  try {
    const symbol = require('expo-symbols');
    SymbolView = symbol.SymbolView;
  } catch (e) {
    console.log('SymbolView not available');
  }
} else {
  // Web-safe SymbolView component - returns a simple View with text
  SymbolView = ({ name, size = 24, tintColor, style, ...props }: any) => {
    const { View, Text } = require('react-native');
    
    // Map common symbol names to text equivalents
    const symbolMap: { [key: string]: string } = {
      'chevron.right': '›',
      'chevron_left': '‹',
      'arrow.up.right.square': '↗',
      'link': '🔗',
      'chevron_right': '›',
    };
    
    const symbolText = symbolMap[name?.web] || symbolMap[name?.ios] || symbolMap[name?.android] || '•';
    
    // Create a simple component that wraps text in a View
    const SimpleSymbol = () => {
      return View({
        style: [{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style],
        ...props,
        children: Text({
          style: { color: tintColor || '#000', fontSize: size * 0.8, textAlign: 'center' },
          children: symbolText
        })
      });
    };
    
    return SimpleSymbol;
  };
}
