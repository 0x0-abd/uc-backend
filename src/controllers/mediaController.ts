import { createClient } from '@supabase/supabase-js';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';

// Create Supabase client
const supabase = createClient('https://ztkfacuydtnsstdazsok.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a2ZhY3V5ZHRuc3N0ZGF6c29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkwNzQ3OTgsImV4cCI6MjAzNDY1MDc5OH0.kWo84p50cFHoKx7fqNyjHvM98eax1g6YtAnQgGg7UVM');

// Multer configuration for handling multipart form data
const storage = multer.memoryStorage();
export const upload = multer({ storage }).single('file');

// Function to handle image upload
export const uploadImage = async (req: Request, res: Response) => {
  console.log("UploadImage called")
//   console.log(req)
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const originalExtension = path.extname(req.file.originalname); // Get the original file extension
  const uniqueFilename = `${uuidv4()}${originalExtension}`;

  const file = req.file;
  const filePath = `public/${uniqueFilename}`;

  try {
    const { data, error } = await supabase.storage.from('ucbucket').upload(filePath, file.buffer);
    if (error) {
      throw error;
    }
    res.status(200).json({ message: 'File uploaded successfully', data });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
};

export const getImageUrl = async (message:any) => {
  const { data } = supabase.storage
  .from('ucbucket')
  .getPublicUrl(message);
  // if (error) {
  //   console.error('Error generating image URL:', error);
  //   return message;
  // }
  return data.publicUrl;
} 

export const deleteImage = async (imageUrl: any) => {
  const urlParts = imageUrl.split('/');
  const bucketName = urlParts[urlParts.indexOf('object') + 2];
  const filePath = urlParts.slice(urlParts.indexOf(bucketName) + 1).join('/');

  const { error } = await supabase.storage.from(bucketName).remove([filePath]);

  if (error) {
    console.error('Error deleting file:', error.message);
  } else {
    console.log('File deleted successfully.');
  }
}