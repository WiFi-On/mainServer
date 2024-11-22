export interface ReturnDataConnectionPosI {
  TechName: string;
  Res: string;
}

export interface ResultThvEissdI {
  result: ReturnDataConnectionPosI[];
  districtFiasId: string;
  localIds: {
    regionId: string;
    cityId: string;
    streetId: string;
    houseId: string;
    flat: string;
  };
}
