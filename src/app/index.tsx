import { useEffect } from 'react';
import { useRouter } from 'expo-router';

/**
 * Main entry point - redirects to tabs layout
 */
export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the tabs layout
    // The tabs are under (tabs) group, so we navigate to the first tab
    router.replace('/smart-map' as any);
  }, [router]);

  return null;
}
