// app/api/resume/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Resume from '../../../lib/models/Resume.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const resume = await Resume.findById(id).lean();
      if (!resume) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      }
      return NextResponse.json(resume);
    }

    const resumes = await Resume.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(resumes);
  } catch (error) {
    console.error('GET /api/resume error:', error);
    return NextResponse.json(
      { error: 'Failed to load resumes', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const resume = await Resume.create({
      personalInfo: body.formData?.personalInfo || body.personalInfo || {},
      summary: body.formData?.summary || body.summary || '',
      skills: body.formData?.skills || body.skills || '',
      technicalSkills: body.formData?.technicalSkills || body.technicalSkills || '', // New Field
      experience: body.formData?.experience || body.experience || [],
      education: body.formData?.education || body.education || [],
      projects: body.formData?.projects || body.projects || [],
      certifications: body.formData?.certifications || body.certifications || [],
      references: body.formData?.references || body.references || [], // New Field
      selectedTemplate: body.selectedTemplate || 'modern',
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error('POST /api/resume error:', error);
    return NextResponse.json(
      { error: 'Save failed', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const updateData = {
      personalInfo: body.personalInfo || body.formData?.personalInfo || {},
      summary: body.summary || body.formData?.summary || '',
      skills: body.skills || body.formData?.skills || '',
      technicalSkills: body.technicalSkills || body.formData?.technicalSkills || '', // New Field
      experience: body.experience || body.formData?.experience || [],
      education: body.education || body.formData?.education || [],
      projects: body.projects || body.formData?.projects || [],
      certifications: body.certifications || body.formData?.certifications || [],
      references: body.references || body.formData?.references || [], // New Field
      selectedTemplate: body.selectedTemplate || body.formData?.selectedTemplate || 'modern',
    };

    const updated = await Resume.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/resume error:', error);
    return NextResponse.json(
      { error: 'Update failed', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const deleted = await Resume.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Resume deleted successfully!' });
  } catch (error) {
    console.error('DELETE /api/resume error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}