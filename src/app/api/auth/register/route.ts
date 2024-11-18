import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/components/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    
    if (!email || !password) {
      return new NextResponse('Missing fields', { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return new NextResponse('User already exists', { status: 400 });
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      }
    });

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return new NextResponse(
      error.message || 'Error creating user', 
      { status: 500 }
    );
  }
} 