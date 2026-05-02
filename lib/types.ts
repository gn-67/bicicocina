export type BikewayClass = 'Class 1' | 'Class 2' | 'Class 3' | 'Class 4';

export type BikewayProperties = {
  BIKEWAY_TYPE: BikewayClass;
};

export type Route = {
  id: string;
  name: string;
  created_by: string;
  length_mi: number;
  rating: number;
  beginner_friendly: boolean;
  tags: string[];
  active_riders: number;
};
