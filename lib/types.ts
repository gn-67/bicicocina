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
  image: string;
  start_label: string;
  start_location: string;
  end_location: string;
  distance_label: string;
  attendee_count: number;
  attendee_avatars: string[];
  is_active: boolean;
};
