const axios = require('axios');
require('dotenv').config();

const HF_API_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-mpnet-base-v2';

const getEmbedding = async (text) => {
    try {
      const response = await axios.post(
        `${HF_API_URL }`,
        { inputs: text },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
        }
      );
  
      const embedding = response.data;
    //   console.log('🔑 Hugging Face API Key:', process.env.HUGGINGFACE_API_KEY);

      // Return flattened embedding
      if (Array.isArray(embedding) && Array.isArray(embedding[0])) {
        return embedding[0];
      }
      return embedding;
    } catch (error) {
      console.error('❌ Failed to fetch embedding:', error.message);
    //   console.log('🔑 Hugging Face API Key:', process.env.HUGGINGFACE_API_KEY);

      return null;
    }
  };

const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return NaN;

  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magA === 0 || magB === 0) return NaN;

  return dot / (magA * magB);
};

module.exports = { getEmbedding, cosineSimilarity };
