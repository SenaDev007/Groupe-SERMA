import fs from "fs/promises";
import path from "path";

// Define TypeScript interfaces for our file-based database
export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "number" | "select" | "radio" | "checkbox" | "textarea";
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select, radio, checkbox
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  entity: "cabinet" | "academy";
  price?: number;
  paymentLink?: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  formId: string;
  formTitle: string;
  entity: "cabinet" | "academy";
  data: Record<string, any>;
  submittedAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const FORMS_FILE = path.join(DATA_DIR, "forms.json");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");

// Ensure files exist
async function ensureInit() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Already exists or permission issue handled downstream
  }

  try {
    await fs.access(FORMS_FILE);
  } catch {
    await fs.writeFile(FORMS_FILE, JSON.stringify([], null, 2), "utf-8");
  }

  try {
    await fs.access(SUBMISSIONS_FILE);
  } catch {
    await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

export async function getForms(): Promise<Form[]> {
  await ensureInit();
  try {
    const content = await fs.readFile(FORMS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading forms file:", err);
    return [];
  }
}

export async function getFormById(id: string): Promise<Form | undefined> {
  const forms = await getForms();
  return forms.find((f) => f.id === id);
}

export async function saveForm(form: Form): Promise<void> {
  await ensureInit();
  const forms = await getForms();
  const index = forms.findIndex((f) => f.id === form.id);
  
  if (index >= 0) {
    forms[index] = {
      ...form,
      updatedAt: new Date().toISOString(),
    };
  } else {
    forms.push({
      ...form,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  await fs.writeFile(FORMS_FILE, JSON.stringify(forms, null, 2), "utf-8");
}

export async function deleteForm(id: string): Promise<boolean> {
  await ensureInit();
  const forms = await getForms();
  const filtered = forms.filter((f) => f.id !== id);
  
  if (filtered.length === forms.length) {
    return false;
  }

  await fs.writeFile(FORMS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

export async function getSubmissions(): Promise<Submission[]> {
  await ensureInit();
  try {
    const content = await fs.readFile(SUBMISSIONS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading submissions file:", err);
    return [];
  }
}

export async function saveSubmission(submission: Omit<Submission, "id" | "submittedAt">): Promise<Submission> {
  await ensureInit();
  const submissions = await getSubmissions();
  
  const newSubmission: Submission = {
    ...submission,
    id: `sub_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`,
    submittedAt: new Date().toISOString(),
  };

  submissions.unshift(newSubmission); // Add to beginning (most recent first)
  await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), "utf-8");
  return newSubmission;
}

export async function deleteSubmission(id: string): Promise<boolean> {
  await ensureInit();
  const submissions = await getSubmissions();
  const filtered = submissions.filter((s) => s.id !== id);
  
  if (filtered.length === submissions.length) {
    return false;
  }

  await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}
