export interface StoreSettingDTO {
  id: string;
  storeName: string;
  address: string;
  phoneNumber: string;
  logoUrl: string;
  receiptFooter: string;
}

export interface UpdateStoreSettingInput {
  storeName: string;
  address?: string;
  phoneNumber?: string;
  logoUrl?: string;
  receiptFooter?: string;
}

