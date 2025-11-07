
import { Appliance } from './types';
import {
  RefrigeratorIcon,
  WasherIcon,
  OvenIcon,
  AirConditionerIcon,
  TvIcon,
  MicrowaveIcon
} from './components/Icons';

export const APPLIANCES: Appliance[] = [
  { id: 'refrigerator', name: 'Refrigerator', icon: RefrigeratorIcon },
  { id: 'washer', name: 'Washing Machine', icon: WasherIcon },
  { id: 'oven', name: 'Oven / Stove', icon: OvenIcon },
  { id: 'ac', name: 'Air Conditioner', icon: AirConditionerIcon },
  { id: 'tv', name: 'Television', icon: TvIcon },
  { id: 'microwave', name: 'Microwave', icon: MicrowaveIcon },
];
