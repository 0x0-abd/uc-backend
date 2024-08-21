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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.getImageUrl = exports.uploadImage = exports.upload = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var uuid_1 = require("uuid");
var multer_1 = require("multer");
var path_1 = require("path");
// Create Supabase client
var supabase = (0, supabase_js_1.createClient)('https://ztkfacuydtnsstdazsok.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a2ZhY3V5ZHRuc3N0ZGF6c29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkwNzQ3OTgsImV4cCI6MjAzNDY1MDc5OH0.kWo84p50cFHoKx7fqNyjHvM98eax1g6YtAnQgGg7UVM');
// Multer configuration for handling multipart form data
var storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({ storage: storage }).single('file');
// Function to handle image upload
var uploadImage = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var originalExtension, uniqueFilename, file, filePath, _a, data, error, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("UploadImage called");
                //   console.log(req)
                if (!req.file) {
                    return [2 /*return*/, res.status(400).send('No file uploaded.')];
                }
                originalExtension = path_1.default.extname(req.file.originalname);
                uniqueFilename = "".concat((0, uuid_1.v4)()).concat(originalExtension);
                file = req.file;
                filePath = "public/".concat(uniqueFilename);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, supabase.storage.from('ucbucket').upload(filePath, file.buffer)];
            case 2:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    throw error;
                }
                res.status(200).json({ message: 'File uploaded successfully', data: data });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                console.error('Error uploading file:', error_1);
                res.status(500).json({ error: 'File upload failed' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.uploadImage = uploadImage;
var getImageUrl = function (message) { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        data = supabase.storage
            .from('ucbucket')
            .getPublicUrl(message).data;
        // if (error) {
        //   console.error('Error generating image URL:', error);
        //   return message;
        // }
        return [2 /*return*/, data.publicUrl];
    });
}); };
exports.getImageUrl = getImageUrl;
var deleteImage = function (imageUrl) { return __awaiter(void 0, void 0, void 0, function () {
    var urlParts, bucketName, filePath, error;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                urlParts = imageUrl.split('/');
                bucketName = urlParts[urlParts.indexOf('object') + 2];
                filePath = urlParts.slice(urlParts.indexOf(bucketName) + 1).join('/');
                return [4 /*yield*/, supabase.storage.from(bucketName).remove([filePath])];
            case 1:
                error = (_a.sent()).error;
                if (error) {
                    console.error('Error deleting file:', error.message);
                }
                else {
                    console.log('File deleted successfully.');
                }
                return [2 /*return*/];
        }
    });
}); };
exports.deleteImage = deleteImage;
