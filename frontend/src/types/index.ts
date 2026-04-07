// UI Component Props
export interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

// Export all types from domain modules
export * from './auth';
export * from './common';
export * from './course';
export * from './category';
export * from './enrollment';
export * from './material';
export * from './dashboard';
export * from './participant';
