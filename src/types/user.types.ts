export interface UserDto {
  id: number;
  userNumber: string;
  districtId?: number;
}

export interface AdminDto {
  id: number;
  username: string;
  email: string;
  districtId: number;
  role: 1 | 2; // 1=Admin, 2=SuperAdmin
  number: string;
}