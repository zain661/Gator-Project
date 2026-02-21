import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName?: string;
};

export function readConfig(): Config {
  const filePath = getConfigFilePath();
  if (!fs.existsSync(filePath)) {
    throw new Error(`Config file does not exist at ${filePath}`);
  }
  const rawData = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(rawData);
  return validateConfig(parsed);
}


export function setUser(username: string): void {
  const cfg = readConfig();     // اقرأ الكونفيغ الحالي
  cfg.currentUserName = username;  // عدّل المستخدم الحالي
  writeConfig(cfg);             // احفظ الملف
}


// helpers (غير مصدّرة)
function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json")
}

function writeConfig(cfg: Config): void {
  const filePath = getConfigFilePath();
  const obj = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName
  };
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), "utf-8");
}


function validateConfig(raw: any): Config {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Config file is not an object");
  }
  if (typeof raw.db_url !== "string") {
    throw new Error("db_url must be a string");
  }
  if (raw.current_user_name !== undefined && typeof raw.current_user_name !== "string") {
    throw new Error("current_user_name must be a string if defined");
  }

  return {
    dbUrl: raw.db_url,
    currentUserName: raw.current_user_name
  };
}

