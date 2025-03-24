export interface ReturnDataConnectionPosI {
  TechName: string;
  Res: string;
  TechId: string;
  thv: boolean;
}

export interface ResultThvEissdI {
  result: ReturnDataConnectionPosI;
  districtFiasId: string;
  infoAddress: {
    regionId: string;
    cityId: string;
    streetId: string;
    houseId: string;
    flat: string;
    regionFullName: string;
    districtName: string;
    districtObject: string;
    streetObject: string;
    streetName: string;
    house: string;
  };
}

export interface TariffSimI {
  serviceId: 10003;
  typeProduct: number;
  typeTariff: number;
  mobileInfo: {
    regionId: string;
    offerId: string;
    regionName: string;
    offerName: string;
    price: number;
    count: number;
    fee: null;
  }[];
}

export interface TariffMrfI {
  productTypeRequest: number;
  serviceId: number;
  techId: string;
  typeProduct: number;
  typeTariff: number;
  params: { paramKey: string; paramValue: string }[]; // Corrected
  productRegion: string;
  productAsrTariffId?: any;
  productTariffName?: any;
}

export interface TariffI {
  productTarId: any;
  productTypeRequest: number;
  serviceId: number;
  techId: string;
  typeProduct: number;
  typeTariff: number;
  id: any;
  options: Array<any>;
}

export interface StatusesApplicationI {
  serviceId: string;
  serviceName: string;
  statusId: string;
  statusName: string;
  statusReasonId: string | null;
  statusReasonName: string | null;
  bitrixStatus: string;
  bitrixCause: string;
}

export interface OptionI {
  optionCost: number;
  optionCount: number;
  optionFee: number;
  optionName: string;
}

export interface FormingApplicationResult {
  err: boolean;
  result: string;
  idApplication?: string;
}
