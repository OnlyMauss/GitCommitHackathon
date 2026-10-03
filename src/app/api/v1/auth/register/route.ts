import { NextResponse } from "next/server";
import { z } from "zod";
import db, { hashPassword } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(128),
  company: z.string().trim().min(2).max(150),
});

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { code: "INVALID_INPUT", message: "Please provide valid name, email (min 6 char password), and company name." },
      { status: 400 }
    );
  }

  const { name, email, password, company } = parsed.data;

  // Check if user already exists
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return NextResponse.json(
      { code: "EMAIL_EXISTS", message: "An account with this email address already exists. Please sign in instead." },
      { status: 409 }
    );
  }

  const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const passwordHash = hashPassword(password);

  try {
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, company, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, email, passwordHash, name, company, "Administrator");

    return NextResponse.json({
      authenticated: true,
      user: {
        id: userId,
        name,
        email,
        company,
        role: "Administrator",
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { code: "REGISTRATION_FAILED", message: "Could not create user account. Please try again." },
      { status: 500 }
    );
  }
}
