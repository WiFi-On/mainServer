export default interface tariffSimI {
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
