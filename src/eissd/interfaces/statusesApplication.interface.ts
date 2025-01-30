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
