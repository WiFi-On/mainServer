export default interface InitDataObject {
  query_id: string;
  user: User;
  auth_date: string;
  signature: string;
  hash: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
  allows_write_to_pm: boolean;
  photo_url: string;
}
