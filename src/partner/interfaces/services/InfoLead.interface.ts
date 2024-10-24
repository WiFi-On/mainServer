export interface ReturnInfoLead {
  idClientBitrix: number;
  idLeadBitrix: number;
  client: Client;
}
export interface Client {
  id: number;
  partner: {
    id: number;
    name: string;
  };
  fio: string;
  tel: string;
  comment: string;
  address: string;
  dateCreate: Date;
}
