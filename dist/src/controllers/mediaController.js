"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.getImageUrl = exports.uploadImage = exports.upload = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const uuid_1 = require("uuid");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Create Supabase client
const supabase = (0, supabase_js_1.createClient)('https://ztkfacuydtnsstdazsok.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a2ZhY3V5ZHRuc3N0ZGF6c29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkwNzQ3OTgsImV4cCI6MjAzNDY1MDc5OH0.kWo84p50cFHoKx7fqNyjHvM98eax1g6YtAnQgGg7UVM');
// Multer configuration for handling multipart form data
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({ storage }).single('file');
// Function to handle image upload
const uploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("UploadImage called");
    //   console.log(req)
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const originalExtension = path_1.default.extname(req.file.originalname); // Get the original file extension
    const uniqueFilename = `${(0, uuid_1.v4)()}${originalExtension}`;
    const file = req.file;
    const filePath = `public/${uniqueFilename}`;
    try {
        const { data, error } = yield supabase.storage.from('ucbucket').upload(filePath, file.buffer);
        if (error) {
            throw error;
        }
        res.status(200).json({ message: 'File uploaded successfully', data });
    }
    catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});
exports.uploadImage = uploadImage;
const getImageUrl = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = supabase.storage
        .from('ucbucket')
        .getPublicUrl(message);
    // if (error) {
    //   console.error('Error generating image URL:', error);
    //   return message;
    // }
    return data.publicUrl;
});
exports.getImageUrl = getImageUrl;
const deleteImage = (imageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const urlParts = imageUrl.split('/');
    const bucketName = urlParts[urlParts.indexOf('object') + 2];
    const filePath = urlParts.slice(urlParts.indexOf(bucketName) + 1).join('/');
    const { error } = yield supabase.storage.from(bucketName).remove([filePath]);
    if (error) {
        console.error('Error deleting file:', error.message);
    }
    else {
        console.log('File deleted successfully.');
    }
});
exports.deleteImage = deleteImage;
