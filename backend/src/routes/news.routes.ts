import { Router } from 'express';
import { Types } from 'mongoose';
import News from '../models/news.model';
import { auth, AuthRequest } from '../middleware/auth.middleware';
import { setCache, getCache, deleteCache, clearCache } from '../utils/redis';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';

const router = Router();
const CACHE_EXPIRATION = 3600; // 1 hour

// Create news article (temporarily without auth for testing)
router.post('/', async (req, res, next) => {
  try {
    const { title, content, excerpt, category, image, tags } = req.body;
    const news = new News({
      title,
      content,
      excerpt,
      category,
      image,
      tags,
      author: '65d8c25a3d96b6c594ad7d3c', // Temporary static author ID for testing
    });

    await news.save();
    await clearCache('news:*');
    res.status(201).json({ success: true, data: news });
  } catch (error) {
    next(error);
  }
});

// Test route
router.get('/test', async (req, res) => {
  res.json({ message: 'News API is working!' });
});

// Get all news articles with pagination and caching
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const cacheKey = `news:all:${page}:${limit}`;

    // Try to get from cache first
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.json({ success: true, data: cachedData });
    }

    const skip = (page - 1) * limit;
    const news = await News.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Add default author data if not populated
    const newsWithAuthor = news.map(item => ({
      ...item,
      author: {
        name: 'Anonymous',
        avatar: '/placeholder-avatar.jpg'
      }
    }));

    const total = await News.countDocuments();
    const data = {
      news: newsWithAuthor,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    // Set cache
    await setCache(cacheKey, data, CACHE_EXPIRATION);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// Get single news article
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid news ID', 400);
    }

    // Try to get from cache first
    const cacheKey = `news:${id}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.json({ success: true, data: cachedData });
    }

    const news = await News.findById(id).lean();

    if (!news) {
      throw new AppError('News article not found', 404);
    }

    // Add default author data if not populated
    const newsWithAuthor = {
      ...news,
      author: {
        name: 'Anonymous',
        avatar: '/placeholder-avatar.jpg'
      }
    };

    // Update views count
    await News.findByIdAndUpdate(id, { $inc: { views: 1 } });
    newsWithAuthor.views = (newsWithAuthor.views || 0) + 1;

    // Cache the result
    await setCache(cacheKey, newsWithAuthor, CACHE_EXPIRATION);
    res.json({ success: true, data: newsWithAuthor });
  } catch (error) {
    next(error);
  }
});

// Update news article
router.put('/:id', auth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid news ID', 400);
    }

    const news = await News.findById(id);
    if (!news) {
      throw new AppError('News article not found', 404);
    }

    if (news.author.toString() !== req.user?.id) {
      throw new AppError('Not authorized to update this news article', 403);
    }

    const updatedNews = await News.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('author', 'name avatar');

    await clearCache(`news:${id}`);
    await clearCache('news:all:*');
    res.json({ success: true, data: updatedNews });
  } catch (error) {
    next(error);
  }
});

// Delete news article
router.delete('/:id', auth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid news ID', 400);
    }

    const news = await News.findById(id);
    if (!news) {
      throw new AppError('News article not found', 404);
    }

    if (news.author.toString() !== req.user?.id) {
      throw new AppError('Not authorized to delete this news article', 403);
    }

    await News.findByIdAndDelete(id);
    await clearCache(`news:${id}`);
    await clearCache('news:all:*');
    res.json({ success: true, message: 'News article deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Like/Unlike news article
router.post('/:id/like', auth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid news ID', 400);
    }

    const news = await News.findById(id);
    if (!news) {
      throw new AppError('News article not found', 404);
    }

    const userIndex = news.likes.indexOf(req.user?.id);
    if (userIndex === -1) {
      news.likes.push(req.user?.id);
    } else {
      news.likes.splice(userIndex, 1);
    }

    await news.save();
    await clearCache(`news:${id}`);
    res.json({ success: true, data: news });
  } catch (error) {
    next(error);
  }
});

// Add comment
router.post('/:id/comments', auth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid news ID', 400);
    }

    if (!content) {
      throw new AppError('Comment content is required', 400);
    }

    const news = await News.findById(id);
    if (!news) {
      throw new AppError('News article not found', 404);
    }

    news.comments.push({
      user: req.user?.id,
      content,
      createdAt: new Date(),
    });

    await news.save();
    await clearCache(`news:${id}`);
    
    const updatedNews = await News.findById(id)
      .populate('author', 'name avatar')
      .populate('comments.user', 'name avatar');

    res.json({ success: true, data: updatedNews });
  } catch (error) {
    next(error);
  }
});

export default router; 