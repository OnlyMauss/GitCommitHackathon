import { NextResponse } from "next/server";
import { z } from "zod";
import db, { verifyPassword } from "@/lib/db";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(128),
  remember: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ code: "INVALID_INPUT", message: "Enter a valid email address and password." }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as {
    id: string;
    email: string;
    password_hash: string;
    name: string;
    company: string;
    role: string;
  } | undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return NextResponse.json({ code: "INVALID_CREDENTIALS", message: "Incorrect email or password. Try the demo account below." }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
    },
  });
}
