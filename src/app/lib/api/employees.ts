import { apiFetch, buildQuery } from "./client";

export interface Employee {
  id: number;
  branchId: number;
  name: string;
  active: boolean;
  profiles: string[];
  profilePlatforms: string[];
}

type EmployeeWritePayload = {
  name: string;
  active: boolean;
  profiles: string[];
  profilePlatforms: string[];
};

export const employeesApi = {
  getAll: (branchId: string): Promise<Employee[]> =>
    apiFetch(`/employees${buildQuery({ branch_id: branchId })}`),

  create: (
    branchId: string,
    data: EmployeeWritePayload
  ): Promise<Employee> =>
    apiFetch(`/employees${buildQuery({ branch_id: branchId })}`, {
      method: "POST",
      body: data,
    }),

  update: (
    id: number,
    data: Partial<EmployeeWritePayload>
  ): Promise<Employee> =>
    apiFetch(`/employees/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: number): Promise<void> =>
    apiFetch(`/employees/${id}`, { method: "DELETE" }),
};
