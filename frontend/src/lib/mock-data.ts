export type CompanyStatus = "stable" | "warning" | "danger";

export interface FinancialData {
    year: number;
    revenue: number; // in million KRW
    operatingProfit: number; // in million KRW
    netIncome: number; // in million KRW
    debtRatio: number; // percentage
    capitalImpairment: boolean;
}

export interface PatentData {
    registered: number;
    pending: number;
    grade: "S" | "A" | "B" | "C";
}

export interface ProjectHistory {
    id: string;
    title: string;
    period: string;
    budget: number; // in million KRW
    result: "success" | "failure" | "ongoing";
}

export interface CompanyData {
    id: string; // Business Registration Number
    name: string;
    ceo: string;
    foundedDate: string;
    address: string;
    sector: string;
    status?: CompanyStatus;
    financials?: FinancialData[];
    patents?: PatentData;
    certifications?: string[]; // e.g., "Venture", "Inno-Biz"
    history?: ProjectHistory[];
    score?: {
        total: number;
        grade: "S" | "A" | "B" | "C";
        breakdown: {
            financial: number; // max 30
            technology: number; // max 40
            experience: number; // max 30
        }
    }
}

export const MOCK_COMPANIES: Record<string, CompanyData> = {
    "123-45-67890": {
        id: "123-45-67890",
        name: "User Corp",
        ceo: "Gil-Dong Hong",
        foundedDate: "2020-05-15",
        address: "Teheran-ro 427, Gangnam-gu, Seoul",
        sector: "Software Development",
        status: "stable",
        financials: [
            { year: 2023, revenue: 12000, operatingProfit: 1500, netIncome: 1200, debtRatio: 120, capitalImpairment: false },
            { year: 2022, revenue: 8500, operatingProfit: 800, netIncome: 600, debtRatio: 150, capitalImpairment: false },
            { year: 2021, revenue: 5000, operatingProfit: -200, netIncome: -300, debtRatio: 200, capitalImpairment: false },
        ],
        patents: {
            registered: 5,
            pending: 2,
            grade: "A",
        },
        certifications: ["Venture", "Inno-Biz", "R&D Center"],
        history: [
            { id: "prd-001", title: "AI-based Logistics Optimization", period: "2022-2023", budget: 300, result: "success" },
            { id: "prd-002", title: "Blockchain Supply Chain", period: "2021-2022", budget: 200, result: "success" },
        ],
        score: {
            total: 85,
            grade: "A",
            breakdown: {
                financial: 25,
                technology: 35,
                experience: 25
            }
        }
    }
};
