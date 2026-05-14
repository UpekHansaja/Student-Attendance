import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Student from '../../../../models/Student';

export async function GET(request, { params }) {
  const { nic } = await params;

  try {
    await dbConnect();
    const student = await Student.findOne({ nic });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
