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
