export type Partner = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
  website?: string;
  logo?: string;
};

export const PARTNERS: Partner[] = [
  {
    id: 'bicycle-kitchen',
    name: 'Bicycle Kitchen',
    shortName: 'Bicycle Kitchen',
    description:
      'A DIY community bike shop in East Hollywood. Drop in to fix your bike with the help of volunteer mechanics, take a class, or get involved.',
    address: '4429 Fountain Ave, Los Angeles, CA 90029',
    coordinates: [-118.28627025865836, 34.096029589542695],
    website: 'https://bicyclekitchen.org',
    logo: 'https://www.figma.com/api/mcp/asset/4b270d21-754f-428d-939c-931fe83bd71d',
  },
  {
    id: 'bike-oven',
    name: 'Bike Oven',
    shortName: 'Bike Oven',
    description:
      'A community-powered bike shop in Highland Park offering free DIY repair nights, workshops, and a welcoming space for riders of all levels.',
    address: '3706 N Figueroa St, Los Angeles, CA 90065',
    coordinates: [-118.2086, 34.1081],
    website: 'https://bikeoven.com',
  },
  {
    id: 'reciclos-la',
    name: 'Re:Ciclos LA',
    shortName: 'Re:Ciclos',
    description:
      'A community bike organization rooted in South LA, promoting cycling as accessible, sustainable transportation for underserved neighborhoods.',
    address: '5000 S Central Ave, Los Angeles, CA 90011',
    coordinates: [-118.2437, 34.0019],
    website: 'https://reciclosla.org',
  },
];
