import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

/**
 * Hook to check backend health status
 */
export function useHealthCheck() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['healthCheck'],
    queryFn: async () => {
      if (!actor) return 'Disconnected';
      return actor.healthCheck();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
