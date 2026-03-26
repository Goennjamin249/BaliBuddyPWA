import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Star } from 'lucide-react-native';

interface TripAdvisorBrandingProps {
  rating?: number;
  reviewCount?: number;
  showLogo?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function TripAdvisorBranding({ 
  rating, 
  reviewCount, 
  showLogo = true,
  size = 'medium' 
}: TripAdvisorBrandingProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star 
            key={i} 
            size={size === 'small' ? 12 : size === 'large' ? 18 : 14} 
            color="#F59E0B" 
            fill="#F59E0B" 
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <View key={i} style={styles.halfStarContainer}>
            <Star 
              size={size === 'small' ? 12 : size === 'large' ? 18 : 14} 
              color="#F59E0B" 
              fill="#F59E0B"
              style={styles.halfStar}
            />
          </View>
        );
      } else {
        stars.push(
          <Star 
            key={i} 
            size={size === 'small' ? 12 : size === 'large' ? 18 : 14} 
            color="#E5E7EB" 
          />
        );
      }
    }

    return stars;
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          logo: styles.logoSmall,
          text: styles.textSmall,
          rating: styles.ratingSmall,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          logo: styles.logoLarge,
          text: styles.textLarge,
          rating: styles.ratingLarge,
        };
      default:
        return {
          container: styles.containerMedium,
          logo: styles.logoMedium,
          text: styles.textMedium,
          rating: styles.ratingMedium,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, sizeStyles.container]}>
      {showLogo && (
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, sizeStyles.logo]}>
            <Text style={[styles.logoText, sizeStyles.text]}>TA</Text>
          </View>
          <Text style={[styles.logoLabel, sizeStyles.text]}>TripAdvisor</Text>
        </View>
      )}
      
      {rating && (
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            {renderStars(rating)}
          </View>
          <Text style={[styles.ratingText, sizeStyles.rating]}>
            {rating.toFixed(1)}
          </Text>
          {reviewCount && (
            <Text style={[styles.reviewCount, sizeStyles.text]}>
              ({reviewCount.toLocaleString()})
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  containerSmall: {
    gap: 4,
  },
  containerMedium: {
    gap: 8,
  },
  containerLarge: {
    gap: 12,
  },
  
  // Logo
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoCircle: {
    backgroundColor: '#00AF87',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  logoMedium: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  logoLarge: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  logoTextSmall: {
    fontSize: 8,
  },
  logoTextMedium: {
    fontSize: 10,
  },
  logoTextLarge: {
    fontSize: 12,
  },
  logoLabel: {
    color: '#00AF87',
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 14,
  },
  
  // Rating
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  halfStarContainer: {
    position: 'relative',
  },
  halfStar: {
    opacity: 0.5,
  },
  ratingText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  ratingSmall: {
    fontSize: 11,
  },
  ratingMedium: {
    fontSize: 13,
  },
  ratingLarge: {
    fontSize: 15,
  },
  reviewCount: {
    color: '#64748B',
    fontWeight: '500',
  },
});