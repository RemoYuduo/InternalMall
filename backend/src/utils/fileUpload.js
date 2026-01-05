const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// 确保上传目录存在
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/products');
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: async (req, file, cb) => {
    try {
      const { v4: uuidv4 } = await import('uuid');
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    } catch (error) {
      cb(error);
    }
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 只允许图片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'), false);
  }
};

// 创建multer实例
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // 最多10个文件
  }
});

/**
 * 处理单个图片上传
 * @param {Request} req Express请求对象
 * @param {Response} res Express响应对象
 * @param {Function} next 下一个中间件
 */
const uploadSingle = upload.single('image');

/**
 * 处理多个图片上传
 * @param {number} maxCount 最大上传文件数量
 * @returns {Function} 中间件函数
 */
const uploadMultiple = (maxCount = 5) => upload.array('images', maxCount);

/**
 * 图片压缩处理
 * @param {string} inputPath 输入文件路径
 * @param {string} outputPath 输出文件路径
 * @param {Object} options 压缩选项
 * @returns {Promise<void>}
 */
const compressImage = async (inputPath, outputPath, options = {}) => {
  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'jpeg'
  } = options;

  try {
    await sharp(inputPath)
      .resize(width, height, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality })
      .toFile(outputPath);
  } catch (error) {
    console.error('图片压缩失败:', error);
    // 如果压缩失败，复制原文件
    fs.copyFileSync(inputPath, outputPath);
  }
};

/**
 * 处理上传的图片并压缩
 * @param {Array} files 上传的文件数组
 * @returns {Promise<Array>} 处理后的文件信息数组
 */
const processUploadImages = async (files) => {
  const results = [];
  
  for (const file of files) {
    try {
      // 创建压缩后的文件路径
      const compressedPath = path.join(
        path.dirname(file.path),
        `compressed_${path.basename(file.path, path.extname(file.path))}.jpg`
      );
      
      // 压缩图片
      await compressImage(file.path, compressedPath);
      
      // 删除原文件
      fs.unlinkSync(file.path);
      
      // 返回相对路径，前端可以通过API基础URL访问
      // 只需要products/文件名部分，不需要uploads前缀
      const relativePath = path.relative(
        path.join(__dirname, '../../uploads'),
        compressedPath
      );
      
      results.push({
        originalName: file.originalname,
        filename: path.basename(compressedPath),
        path: compressedPath,
        url: `/uploads/${relativePath}`,
        size: fs.statSync(compressedPath).size
      });
    } catch (error) {
      console.error(`处理图片失败: ${file.originalname}`, error);
      // 如果处理失败，保留原文件路径
      const relativePath = path.relative(
        path.join(__dirname, '../../'),
        file.path
      );
      
      results.push({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        url: `/uploads/${relativePath}`,
        size: file.size,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * 删除上传的图片
 * @param {string} imagePath 图片路径或URL
 * @returns {boolean} 是否删除成功
 */
const deleteImage = (imagePath) => {
  try {
    // 如果是URL，提取相对路径
    if (imagePath.startsWith('/')) {
      imagePath = path.join(__dirname, '../../', imagePath);
    }
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('删除图片失败:', error);
    return false;
  }
};

/**
 * 获取图片信息
 * @param {string} imagePath 图片路径或URL
 * @returns {Object|null} 图片信息
 */
const getImageInfo = (imagePath) => {
  try {
    // 如果是URL，提取相对路径
    if (imagePath.startsWith('/')) {
      imagePath = path.join(__dirname, '../../', imagePath);
    }
    
    if (!fs.existsSync(imagePath)) {
      return null;
    }
    
    const stats = fs.statSync(imagePath);
    return {
      path: imagePath,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    };
  } catch (error) {
    console.error('获取图片信息失败:', error);
    return null;
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  processUploadImages,
  compressImage,
  deleteImage,
  getImageInfo
};