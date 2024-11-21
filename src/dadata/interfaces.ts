export interface AddressDadataI {
  region_kladr_id: string;
  region_with_type: string;
  region_type: string;
  region_type_full: string;
  region: string;

  city_fias_id: string;
  city_with_type: string;
  city_type: string;
  city_type_full: string;
  city: string;

  settlement_fias_id: string;
  settlement_with_type: string;
  settlement_type: string;
  settlement_type_full: string;
  settlement: string;

  street_with_type: string;
  street_type: string;
  street_type_full: string;
  street: string;

  area_with_type: string;
  area_type: string;
  area_type_full: string;
  area: string;

  house_type: string;
  house_type_full: string;
  house: string;

  flat_type: string;
  flat_type_full: string;
  flat: string;

  block_type: string;
  block_type_full: string;
  block: string;
}

export interface AddressResponseDadataI {
  suggestions: Array<{
    value: string;
    unrestricted_value: string;
    data: AddressDadataI | null; // Data can be null if no data is available
  }>;
}
