export interface Appliance {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface Technician {
    name: string;
    address: string;
    phone?: string;
    mapsUrl?: string;
}

export enum AppStep {
  SELECT_APPLIANCE,
  DESCRIBE_ISSUE,
  DIAGNOSING,
  SHOW_DIAGNOSIS,
  FINDING_TECHNICIAN,
  SHOW_TECHNICIANS,
}

export enum SortOption {
  DEFAULT = 'default',
  NAME_AZ = 'name_az',
}
