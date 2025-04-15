const db = require('../db/pool');

const createTableIfNotExists = async () => {
  try {

    await db.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ questions table ensured.');
  } catch (err) {
    console.error('❌ Error ensuring table exists:', err.message);
  }
};

// Call it once during module load
createTableIfNotExists();

const getAllQuestions = async () => {
    const result = await db.query('SELECT * FROM questions');
    return result.rows;
  };

const addQuestion = async (text) => {
  try {
    const result = await db.query(
      'INSERT INTO questions (question_text) VALUES ($1) RETURNING *',
      [text]
    );
    // const existing = await db.query(
    //     'SELECT * FROM questions WHERE question_text = $1',
    //     [text]
    //   );
    // if (existing.rows.length > 0) {
    //     console.log('⚠️ Question already exists. Skipping insert.');
    //     return;
    //   }
    console.log('✅ Inserted Question:', result.rows[0]);  // Log inserted data
    return result.rows[0];
  } catch (err) {
    console.error('❌ Error inserting question:', err.message);
    throw err;
  }
};

module.exports = { getAllQuestions, addQuestion };
