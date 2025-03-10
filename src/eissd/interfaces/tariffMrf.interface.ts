export default interface tariffMrfI {
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
