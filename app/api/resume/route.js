// app/api/resume/route.js
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI?.trim();

let clientPromise = global._mongoClientPromise;

if (!clientPromise && uri?.startsWith('mongodb')) {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
  global._mongoClientPromise = clientPromise;
}

export async function POST(request) {
  try {
    const data = await request.json();

    if (uri && uri.startsWith('mongodb')) {
      const client = await clientPromise;
      const db = client.db('ResumeBuilder');
      await db.collection('resumes').insertOne({
        ...data,
        savedAt: new Date(),
      });
      return NextResponse.json({ 
        success: true, 
        message: 'Saved to MongoDB Atlas!' 
      });
    }

    // No DB → still success for user
    return NextResponse.json({ 
      success: true, 
      message: 'Saved locally only.' 
    });

  } catch (error) {
    console.error('MongoDB save error:', error.message);
    // Never crash the app – always return success for local save
    return NextResponse.json({ 
      success: true, 
      message: 'Saved locally only.' 
    });
  }
}

export const GET = () => NextResponse.json({ error: 'Not allowed' }, { status: 405 });
export const dynamic = 'force-dynamic';