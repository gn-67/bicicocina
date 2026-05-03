export type KitchenEvent = {
  id: string;
  name: string;
  dateISO: string; // "YYYY-MM-DD"
  time: string;
  location: string;
  tags: string[];
  image?: string;
  description: string;
};

export const KITCHEN_EVENTS: KitchenEvent[] = [
  {
    id: 'ev-open-shop-may7',
    name: 'Open Shop Night',
    dateISO: '2026-05-07',
    time: 'Thu, May 7 | 7:00 PM',
    location: 'Bicycle Kitchen, 4429 Fountain Ave',
    tags: ['DIY', 'Community'],
    description:
      'Drop in to work on your bike with fellow community members. Tools, stands, and volunteer mechanics are available. All skill levels welcome — whether you need help fixing a flat or tuning your derailleur.',
  },
  {
    id: 'ev-ftwnb-may13',
    name: 'FTWNB Night',
    dateISO: '2026-05-13',
    time: 'Tue, May 13 | 7:00 PM',
    location: 'Bicycle Kitchen, 4429 Fountain Ave',
    tags: ['FTWNB', 'Safe Space'],
    description:
      'A dedicated night for folks who identify as female, trans, women, or non-binary. Come work on your bike in a supportive, welcoming environment. Experienced volunteer mechanics on hand.',
  },
  {
    id: 'ev-workshop-may17',
    name: 'Basic Repair Workshop',
    dateISO: '2026-05-17',
    time: 'Sat, May 17 | 11:00 AM',
    location: 'Bicycle Kitchen, 4429 Fountain Ave',
    tags: ['Workshop', 'Beginner'],
    description:
      'Learn the essentials: fixing a flat tire, adjusting brakes and gears, and cleaning your drivetrain. Perfect for newer riders who just picked up a repaired bike and want to feel confident maintaining it.',
  },
  {
    id: 'ev-group-ride-may21',
    name: 'Group Ride: Silver Lake Loop',
    dateISO: '2026-05-21',
    time: 'Thu, May 21 | 6:00 PM',
    location: 'Start: 4429 Fountain Ave',
    tags: ['Group Ride', 'Beginner'],
    description:
      'An easy ~5 mile loop through Silver Lake and Los Feliz. Great for newer riders who want to practice navigating streets with experienced Kitchen volunteers by their side.',
  },
  {
    id: 'ev-open-shop-may28',
    name: 'Open Shop Night',
    dateISO: '2026-05-28',
    time: 'Thu, May 28 | 7:00 PM',
    location: 'Bicycle Kitchen, 4429 Fountain Ave',
    tags: ['DIY', 'Community'],
    description:
      'Weekly open shop. Bring your bike, bring a friend. Tools and stands provided. Volunteer mechanics help you do the work yourself — we teach, you wrench.',
  },
];
