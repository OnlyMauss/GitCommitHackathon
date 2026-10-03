import fs from "fs";
import path from "path";
import crypto from "crypto";

interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  company: string;
  role: string;
  created_at: string;
}

interface DocumentItem {
  id: string;
  file_name: string;
  type: string;
  counterparty: string;
  date: string;
  amount: string;
  status: string;
  confidence: number;
}

interface LedgerItem {
  id: string;
  date: string;
  source: string;
  description: string;
  debit: string;
  credit: string;
  amount: string;
  status: string;
}

interface DbData {
  users: User[];
  settings: Record<string, string>;
  documents: DocumentItem[];
  ledger_entries: LedgerItem[];
}

const DATA_FILE = path.join(process.cwd(), "finpilot-data.json");

function loadData(): DbData {
  let data: DbData = {
    users: [],
    settings: {},
    documents: [],
    ledger_entries: [],
  };

  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      data = JSON.parse(content);
    }
  } catch (err) {
    console.error("Error loading db file:", err);
  }

  // Seed default admin if empty
  if (!data.users || data.users.length === 0) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync("demo2026", salt, 64).toString("hex");
    const demoPasswordHash = `${salt}:${hash}`;
    data.users = [
      {
        id: "demo-user-01",
        email: "admin@finpilot.ai",
        password_hash: demoPasswordHash,
        name: "Ana Vlas",
        company: "Nordic Retail SRL",
        role: "Administrator",
        created_at: new Date().toISOString(),
      },
    ];
  }

  // Seed documents if empty
  if (!data.documents || data.documents.length === 0) {
    data.documents = [
      { id: "FP-1048", file_name: "invoice_1048_linella.pdf", type: "Invoice", counterparty: "Linella Market SRL", date: "Sep 28, 2026", amount: "12,480.00 MDL", status: "Ready", confidence: 97 },
      { id: "FP-1047", file_name: "factura_0926_omega.pdf", type: "Invoice", counterparty: "Omega Construct SRL", date: "Sep 27, 2026", amount: "6,840.00 MDL", status: "Needs review", confidence: 76 },
      { id: "FP-1046", file_name: "bon_fiscal_coffee.jpg", type: "Receipt", counterparty: "Coffee Point", date: "Sep 25, 2026", amount: "785.00 MDL", status: "Posted", confidence: 99 },
      { id: "FP-1045", file_name: "invoice_cloud_eu.pdf", type: "Invoice", counterparty: "Northstar Cloud Ltd", date: "Sep 24, 2026", amount: "2,190.00 EUR", status: "Processing", confidence: 88 },
      { id: "FP-1044", file_name: "extras_cont_septembrie.pdf", type: "Bank statement", counterparty: "maib", date: "Sep 23, 2026", amount: "—", status: "Posted", confidence: 98 },
    ];
  }

  // Seed ledger entries if empty
  if (!data.ledger_entries || data.ledger_entries.length === 0) {
    data.ledger_entries = [
      { id: "JE-0284", date: "Sep 28, 2026", source: "FP-1048", description: "Inventory purchase — Linella Market SRL", debit: "217.1 Inventory", credit: "521.1 Trade payables", amount: "12,480.00 MDL", status: "Draft" },
      { id: "JE-0283", date: "Sep 25, 2026", source: "FP-1046", description: "Office refreshments — Coffee Point", debit: "713.9 Administrative expenses", credit: "241.1 Cash", amount: "785.00 MDL", status: "Posted" },
      { id: "JE-0282", date: "Sep 23, 2026", source: "FP-1044", description: "Monthly bank service fee", debit: "714.1 Bank charges", credit: "242.1 Current accounts", amount: "240.00 MDL", status: "Posted" },
      { id: "JE-0281", date: "Sep 21, 2026", source: "FP-1042", description: "Professional services — Legal Office", debit: "713.4 Professional fees", credit: "521.1 Trade payables", amount: "4,500.00 MDL", status: "Posted" },
      { id: "JE-0280", date: "Sep 20, 2026", source: "FP-1041", description: "Customer payment — Inv. #00918", debit: "242.1 Current accounts", credit: "221.1 Trade receivables", amount: "18,900.00 MDL", status: "Posted" },
    ];
  }

  if (!data.settings) {
    data.settings = {};
  }

  saveData(data);
  return data;
}

function saveData(data: DbData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving db file:", err);
  }
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(key, "hex"));
  } catch {
    return false;
  }
}

const dbProxy = {
  prepare: (sql: string) => {
    const cleanSql = sql.trim().replace(/\s+/g, " ");
    return {
      get: (...params: unknown[]) => {
        const data = loadData();
        if (cleanSql.includes("FROM users WHERE email = ?") && cleanSql.includes("COUNT(*)")) {
          const email = typeof params[0] === "string" ? params[0].toLowerCase() : "";
          const user = data.users.find((u) => u.email.toLowerCase() === email);
          return { count: user ? 1 : 0 };
        }
        if (cleanSql.includes("FROM users WHERE email = ?") && cleanSql.includes("SELECT *")) {
          const email = typeof params[0] === "string" ? params[0].toLowerCase() : "";
          const user = data.users.find((u) => u.email.toLowerCase() === email);
          return user ? { ...user } : undefined;
        }
        if (cleanSql.includes("FROM users WHERE email = ?") && cleanSql.includes("SELECT id")) {
          const email = typeof params[0] === "string" ? params[0].toLowerCase() : "";
          const user = data.users.find((u) => u.email.toLowerCase() === email);
          return user ? { id: user.id } : undefined;
        }
        if (cleanSql.includes("FROM documents") && cleanSql.includes("COUNT(*)")) {
          return { count: data.documents.length };
        }
        if (cleanSql.includes("FROM ledger_entries") && cleanSql.includes("COUNT(*)")) {
          return { count: data.ledger_entries.length };
        }
        return undefined;
      },
      all: () => {
        const data = loadData();
        if (cleanSql.includes("FROM settings")) {
          return Object.entries(data.settings).map(([key, value]) => ({ key, value }));
        }
        if (cleanSql.includes("FROM ledger_entries")) {
          return [...data.ledger_entries];
        }
        if (cleanSql.includes("FROM documents")) {
          return [...data.documents];
        }
        return [];
      },
      run: (...params: unknown[]) => {
        const data = loadData();
        if (cleanSql.startsWith("INSERT INTO users")) {
          const [id, email, password_hash, name, company, role = "Administrator"] = params as string[];
          data.users.push({
            id: id || "",
            email: (email || "").toLowerCase(),
            password_hash: password_hash || "",
            name: name || "",
            company: company || "",
            role: role || "Administrator",
            created_at: new Date().toISOString(),
          });
          saveData(data);
          return { changes: 1 };
        }
        if (cleanSql.startsWith("INSERT OR REPLACE INTO settings") || cleanSql.startsWith("INSERT INTO settings")) {
          const [key, value] = params as string[];
          if (key) {
            data.settings[key] = value || "";
            saveData(data);
          }
          return { changes: 1 };
        }
        if (cleanSql.startsWith("INSERT INTO documents")) {
          const [id, file_name, type, counterparty, date, amount, status, confidence] = params as [string, string, string, string, string, string, string, number];
          data.documents.push({
            id: id || "",
            file_name: file_name || "",
            type: type || "",
            counterparty: counterparty || "",
            date: date || "",
            amount: amount || "",
            status: status || "",
            confidence: confidence || 0,
          });
          saveData(data);
          return { changes: 1 };
        }
        if (cleanSql.startsWith("INSERT INTO ledger_entries")) {
          const [id, date, source, description, debit, credit, amount, status] = params as string[];
          data.ledger_entries.push({
            id: id || "",
            date: date || "",
            source: source || "",
            description: description || "",
            debit: debit || "",
            credit: credit || "",
            amount: amount || "",
            status: status || "",
          });
          saveData(data);
          return { changes: 1 };
        }
        return { changes: 0 };
      },
    };
  },
  exec: () => {
    // no-op for table creation in JSON store
  },
  transaction: <T>(fn: (...args: unknown[]) => T) => {
    return (...args: unknown[]) => {
      return fn(...args);
    };
  },
};

export default dbProxy;
