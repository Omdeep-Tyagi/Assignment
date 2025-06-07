const asyncHandler= require("express-async-handler");
const Chapter=require("../models/chapterModel");
const redisClient = require('../redisClient.js'); // import redis client


// @desc Get all chapters (returns all the chapters)
// @route GET /api/v1/chapters
// @access Public
const getChapters = asyncHandler(async (req, res) => {
    // Extract filters from query params
    const {
      class: classFilter,
      unit,
      status,
      weakChapters,
      subject,
      page = 1,
      limit = 10,
    } = req.query;

    // Build the filter object dynamically
    let filter = {};

    if (classFilter) filter.class = classFilter;
    if (unit) filter.unit = unit;
    if (status) filter.status = status;
    if (weakChapters !== undefined) {
      // weakChapters expected as "true" or "false" string in query
      filter.isWeakChapter = weakChapters === "true";
    }
    if (subject) filter.subject = subject;

    // Convert page and limit to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Create a unique cache key based on query params
    const cacheKey = `chapters:${JSON.stringify({
      filter,
      page: pageNum,
      limit: limitNum,
    })}`;

    // Try to get cached data
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      // Cache hit - parse and send response
      //  console.log("Cache hit: Data served from Redis");
      return res.status(200).json(JSON.parse(cachedData));
    }
    



     // Cache miss - query DB
      // console.log("Cache miss: Data served from MongoDB");
    // Get total count of chapters matching the filter (for pagination)
    const totalChapters = await Chapter.countDocuments(filter);

    // Fetch chapters with filter, pagination and sorting (optional)
    const chapters = await Chapter.find(filter)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .exec();

    if ((pageNum - 1) * limitNum >= totalChapters) {
        return res.status(400).json({
        success: false,
        message: "Page number exceeds total available pages",
      });
    }

    const response = {
      success: true,
      totalChapters,
      page: pageNum,
      limit: limitNum,
      chapters,
    };

    // Store response in Redis cache for 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(response));

    res.status(200).json(response);






});

// @desc Get a single chapter (returns a specific chapter)
// @route GET /api/v1/chapters/:id
// @access Public
const getChapter = asyncHandler(async (req, res) => {
     const { id } = req.params;


    // First, check Redis cache
  const cached = await redisClient.get(`chapter:${id}`);
  if (cached) {
   // console.log("Cache hit: Data served from Redis");
    return res.status(200).json({
      success: true,
      data: JSON.parse(cached),
      cached: true
    });
  }

  //  console.log("Cache miss: Data served from MongoDB");
     // Not in cache, fetch from DB
    const chapter = await Chapter.findById(id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    // Cache the result for 1 hour
     await redisClient.setEx(`chapter:${id}`, 3600, JSON.stringify(chapter));

    res.status(200).json({
      success: true,
      data: chapter
    });
});



// @desc Upload chapters to DB from JSON file (admin only)
// @route POST /api/v1/chapters
// @access Public //convert to private
const uploadChapters = asyncHandler(async (req, res) => {
    const file = req.file;

    if (!file || !file.buffer) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    let chapters;
    try {
      chapters = JSON.parse(file.buffer.toString());
    } catch (parseError) {
      return res.status(400).json({ success: false, message: "Invalid JSON format" });
    }

    if (!Array.isArray(chapters)) {
      return res.status(400).json({ success: false, message: "Expected an array of chapters" });
    }

    const insertedChapters = [];
    const rejectedChapters = [];

    for (const chapter of chapters) {
      try {
        const newChapter = new Chapter(chapter);
        await newChapter.validate(); // Schema validation  //  inbuilt Mongoose instance method.
        insertedChapters.push(newChapter);
      } catch (validationError) {
        rejectedChapters.push({
          chapter,
          error: validationError.message
        });
      }
    }

    // Insert all valid chapters in one go
    if (insertedChapters.length > 0) {
      await Chapter.insertMany(insertedChapters);
    }

    // Invalidate Redis cache
    //Wrap this cache deletion in a try/catch block so it doesn’t break the API if Redis is down:
    try {
       const keys = await redisClient.keys('chapters:*');
       if (keys.length > 0) {
          await redisClient.del(keys);
       }
    } catch (error) {
       console.error('Redis cache clear error:', error.message);
    }


    return res.status(201).json({
      success: true,
      message: "Upload completed",
      insertedCount: insertedChapters.length,
      rejectedCount: rejectedChapters.length,
      rejectedChapters
    });



});

module.exports = {
    getChapters,
    getChapter,
    uploadChapters
};