import React, { memo } from 'react';
import { FlashList as ShopifyFlashList, FlashListProps } from '@shopify/flash-list';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

interface CustomFlashListProps<T> extends FlashListProps<T> {
  emptyMessage?: string;
  loading?: boolean;
}

function FlashListComponent<T>({
  emptyMessage,
  loading = false,
  ...props
}: CustomFlashListProps<T>) {
  const { t } = useTranslation();

  const defaultEmptyMessage = emptyMessage || t('common.noData');

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-gray-500 dark:text-gray-400 text-base">
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  return (
    <ShopifyFlashList
      {...props}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-gray-500 dark:text-gray-400 text-base text-center">
            {defaultEmptyMessage}
          </Text>
        </View>
      }
    />
  );
}

export const FlashList = memo(FlashListComponent) as <T>(
  props: CustomFlashListProps<T>
) => React.ReactElement;