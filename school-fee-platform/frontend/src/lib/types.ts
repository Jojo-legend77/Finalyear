export type FeeCategory = {
  id: number;
  name: string;
  code: string;
};

export type StudentFee = {
  id: number;
  category: FeeCategory;
  academic_year: string;
  term: string;
  amount_due: string;
  amount_paid: string;
  outstanding_amount: string;
  status: "outstanding" | "partial" | "paid";
};

export type Student = {
  id: number;
  admission_number: string;
  full_name: string;
  class_name: string;
  section: string;
};

export type PaymentTransaction = {
  id: number;
  tx_ref: string;
  provider: string;
  status: string;
  amount: string;
  currency: string;
  student_name: string;
  parent_name: string;
  checkout_url: string;
  receipt_file: string;
  created_at: string;
  paid_at: string | null;
};

export type ChildDashboard = {
  relationship: string;
  student: Student;
  fees: StudentFee[];
  summary: {
    total_due: string;
    total_paid: string;
    total_outstanding: string;
  };
  transactions: PaymentTransaction[];
};

export type ParentDashboardResponse = {
  parent: {
    id: number;
    name: string;
    email: string;
  };
  children: ChildDashboard[];
};
