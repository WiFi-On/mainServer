export interface BitrixContactData {
  fields: {
    NAME: string;
    SECOND_NAME: string;
    LAST_NAME: string;
    PHONE: Array<{ VALUE: string; VALUE_TYPE: string }>;
    ADDRESS: string;
  };
}
