import type {
  AdminAccessUser,
  AdminAccount,
  AdminBranch,
} from "../../types/admin";

export const ADMIN_BRANCHES_MOCK: AdminBranch[] = [
  {
    id: 1,
    name: "Счастливый взгляд, Сенная ул. 10",
    publicId: "1212",
    isActive: true,
    primaryContact: "Иванов Иван / 8 999 222 11 33",
    usersCount: 1,
    paidUntil: "31.03.2026",
  },
  {
    id: 2,
    name: "Счастливый взгляд, Невский пр. 12",
    publicId: "2121",
    isActive: true,
    primaryContact: "Иванов Иван / 8 999 222 11 33",
    usersCount: 2,
    paidUntil: "30.05.2026",
  },
  {
    id: 3,
    name: "Счастливый взгляд, ул. Сизова 6",
    publicId: "6546",
    isActive: true,
    primaryContact: "Иванов Иван / 8 999 222 11 33",
    usersCount: 2,
    paidUntil: "30.05.2026",
  },
  {
    id: 4,
    name: "Счастливый взгляд, наб. реки Фонтанки 114",
    publicId: "4513",
    isActive: true,
    primaryContact: "Иванов Иван / 8 999 222 11 33",
    usersCount: 4,
    paidUntil: "30.05.2026",
  },
  {
    id: 5,
    name: "Счастливый взгляд, Литейный пр. 2",
    publicId: "3216",
    isActive: true,
    primaryContact: "Иванов Иван / 8 999 222 11 33",
    usersCount: 8,
    paidUntil: "30.05.2026",
  },
];

export const ADMIN_ACCESS_USERS_MOCK: AdminAccessUser[] = [
  {
    id: 1,
    fullName: "Байков Даниил Владимирович",
    role: "Руководитель",
    email: "primer@ya.ru",
    phone: "+7 999 333 22 11",
  },
  {
    id: 2,
    fullName: "Михайлов Павел Павлович",
    role: "Тех. поддержка",
    email: "primer@ya.ru",
    phone: "+7 999 333 22 11",
  },
  {
    id: 3,
    fullName: "Михайлов Павел Павлович",
    role: "Менеджер по продажам",
    email: "primer@ya.ru",
    phone: "+7 999 333 22 11",
  },
];

export const ADMIN_ACCOUNT_MOCK: AdminAccount = {
  id: 1,
  fullName: "Байков Даниил Владимирович",
  role: "Руководитель",
  email: "primer@ya.ru",
  phone: "+7 999 333 22 11",
};
