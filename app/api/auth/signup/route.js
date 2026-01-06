import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // You need to run: npm install bcryptjs
import connectDB from "@/lib/mongodb"; // Importing the file you just created
import User from "@/models/User";

export async function POST(request) {
  try {
    const body = await request.json();
    const { role, email, password, ...otherDetails } = body;

    // 1. Basic Validation
    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Connect to Database
    await connectDB();

    // 3. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // 4. Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create the User
    // We spread (...otherDetails) to automatically include the correct fields
    // (fullName/birthday for applicants OR companyName/industry for companies)
    await User.create({
      role,
      email,
      password: hashedPassword,
      ...otherDetails, 
    });

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}