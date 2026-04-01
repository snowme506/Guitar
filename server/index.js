const express = require('express');
const cors = require('cors');
const { getDb } = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ============ 课程配置 API ============

// 获取单个课程配置
app.get('/api/lessons/:id/config', (req, res) => {
  try {
    const db = getDb();
    const config = db.prepare('SELECT * FROM lesson_configs WHERE lesson_id = ?').get(req.params.id);
    if (!config) {
      return res.json(null);
    }
    res.json({
      lessonId: config.lesson_id,
      title: config.title,
      chordDiagram: config.chord_diagram,
      sheetImageData: config.sheet_image_data,
      targetCount: config.target_count,
      hidden: !!config.hidden,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取所有课程配置
app.get('/api/lessons', (req, res) => {
  try {
    const db = getDb();
    const configs = db.prepare('SELECT * FROM lesson_configs').all();
    const result = {};
    configs.forEach(c => {
      result[c.lesson_id] = {
        lessonId: c.lesson_id,
        title: c.title,
        chordDiagram: c.chord_diagram,
        sheetImageData: c.sheet_image_data,
        targetCount: c.target_count,
        hidden: !!c.hidden,
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 创建/更新课程配置
app.post('/api/lessons/:id/config', (req, res) => {
  try {
    const db = getDb();
    const { title, chordDiagram, sheetImageData, targetCount, hidden } = req.body;
    const lessonId = req.params.id;

    const existing = db.prepare('SELECT * FROM lesson_configs WHERE lesson_id = ?').get(lessonId);
    if (existing) {
      db.prepare(`
        UPDATE lesson_configs SET
          title = COALESCE(?, title),
          chord_diagram = COALESCE(?, chord_diagram),
          sheet_image_data = COALESCE(?, sheet_image_data),
          target_count = COALESCE(?, target_count),
          hidden = COALESCE(?, hidden),
          updated_at = CURRENT_TIMESTAMP
        WHERE lesson_id = ?
      `).run(title, chordDiagram, sheetImageData, targetCount, hidden ? 1 : 0, lessonId);
    } else {
      db.prepare(`
        INSERT INTO lesson_configs (lesson_id, title, chord_diagram, sheet_image_data, target_count, hidden)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(lessonId, title || null, chordDiagram || null, sheetImageData || null, targetCount || 2, hidden ? 1 : 0);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除课程配置
app.delete('/api/lessons/:id/config', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM lesson_configs WHERE lesson_id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ 每日任务 API ============

// 获取每日任务
app.get('/api/daily-mission', (req, res) => {
  try {
    const db = getDb();
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const mission = db.prepare('SELECT * FROM daily_missions WHERE date = ?').get(date);
    if (!mission) {
      return res.json(null);
    }
    res.json({
      date: mission.date,
      goals: JSON.parse(mission.goals_json),
      completed: !!mission.completed,
      completedAt: mission.completed_at,
      starReward: mission.star_reward,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 创建/更新每日任务
app.post('/api/daily-mission', (req, res) => {
  try {
    const db = getDb();
    const { date, goals, completed, completedAt, starReward } = req.body;

    const existing = db.prepare('SELECT * FROM daily_missions WHERE date = ?').get(date);
    if (existing) {
      db.prepare(`
        UPDATE daily_missions SET
          goals_json = ?,
          completed = ?,
          completed_at = ?,
          star_reward = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE date = ?
      `).run(JSON.stringify(goals), completed ? 1 : 0, completedAt || null, starReward || 0, date);
    } else {
      db.prepare(`
        INSERT INTO daily_missions (date, goals_json, completed, completed_at, star_reward)
        VALUES (?, ?, ?, ?, ?)
      `).run(date, JSON.stringify(goals), completed ? 1 : 0, completedAt || null, starReward || 0);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 记录练习次数
app.post('/api/daily-mission/record', (req, res) => {
  try {
    const db = getDb();
    const { date, lessonId } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const mission = db.prepare('SELECT * FROM daily_missions WHERE date = ?').get(targetDate);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    const goals = JSON.parse(mission.goals_json);
    const updatedGoals = goals.map(g => {
      if (g.lessonId === lessonId) {
        return { ...g, currentCount: (g.currentCount || 0) + 1 };
      }
      return g;
    });

    const allCompleted = updatedGoals.every(g => (g.currentCount || 0) >= g.targetCount);

    db.prepare(`
      UPDATE daily_missions SET
        goals_json = ?,
        completed = ?,
        completed_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE date = ?
    `).run(
      JSON.stringify(updatedGoals),
      allCompleted ? 1 : 0,
      allCompleted ? new Date().toISOString() : null,
      targetDate
    );

    res.json({ success: true, goals: updatedGoals, completed: allCompleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ 学习进度 API ============

// 获取单个课程进度
app.get('/api/progress/:lessonId', (req, res) => {
  try {
    const db = getDb();
    const progress = db.prepare('SELECT * FROM progress WHERE lesson_id = ?').get(req.params.lessonId);
    if (!progress) {
      return res.json(null);
    }
    res.json({
      lessonId: progress.lesson_id,
      completed: !!progress.completed,
      bestScore: progress.best_score,
      starsEarned: progress.stars_earned,
      attempts: progress.attempts,
      lastPlayed: progress.last_played,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取全局进度
app.get('/api/progress', (req, res) => {
  try {
    const db = getDb();
    const global = db.prepare('SELECT * FROM global_progress WHERE id = 1').get();
    const allProgress = db.prepare('SELECT * FROM progress').all();

    const lessons = {};
    allProgress.forEach(p => {
      lessons[p.lesson_id] = {
        completed: !!p.completed,
        bestScore: p.best_score,
        starsEarned: p.stars_earned,
        attempts: p.attempts,
        lastPlayed: p.last_played,
      };
    });

    res.json({
      totalStars: global?.total_stars || 0,
      earnedBadges: JSON.parse(global?.earned_badges_json || '[]'),
      outfits: JSON.parse(global?.outfits_json || '[]'),
      lessons,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新课程进度
app.post('/api/progress/:lessonId', (req, res) => {
  try {
    const db = getDb();
    const { score, stars, completed } = req.body;
    const lessonId = req.params.lessonId;

    const existing = db.prepare('SELECT * FROM progress WHERE lesson_id = ?').get(lessonId);
    const isBetter = !existing || score > existing.best_score;

    if (existing) {
      db.prepare(`
        UPDATE progress SET
          best_score = ?,
          stars_earned = ?,
          attempts = attempts + 1,
          completed = ?,
          last_played = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE lesson_id = ?
      `).run(
        isBetter ? score : existing.best_score,
        isBetter ? stars : existing.stars_earned,
        completed ? 1 : 0,
        new Date().toISOString(),
        lessonId
      );
    } else {
      db.prepare(`
        INSERT INTO progress (lesson_id, best_score, stars_earned, attempts, completed, last_played)
        VALUES (?, ?, ?, 1, ?, ?)
      `).run(lessonId, score, stars, completed ? 1 : 0, new Date().toISOString());
    }

    // 更新全局星星
    if (isBetter && stars > 0) {
      db.prepare('UPDATE global_progress SET total_stars = total_stars + ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(stars);
    }

    res.json({ success: true, isBetter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 添加星星
app.post('/api/progress/add-stars', (req, res) => {
  try {
    const db = getDb();
    const { count } = req.body;
    db.prepare('UPDATE global_progress SET total_stars = total_stars + ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(count);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 添加徽章
app.post('/api/progress/add-badge', (req, res) => {
  try {
    const db = getDb();
    const { badgeId } = req.body;
    const global = db.prepare('SELECT * FROM global_progress WHERE id = 1').get();
    const badges = JSON.parse(global?.earned_badges_json || '[]');
    if (!badges.includes(badgeId)) {
      badges.push(badgeId);
      db.prepare('UPDATE global_progress SET earned_badges_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(JSON.stringify(badges));
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 解锁装扮
app.post('/api/progress/unlock-outfit', (req, res) => {
  try {
    const db = getDb();
    const { outfitId } = req.body;
    const global = db.prepare('SELECT * FROM global_progress WHERE id = 1').get();
    const outfits = JSON.parse(global?.outfits_json || '[]');
    if (!outfits.includes(outfitId)) {
      outfits.push(outfitId);
      db.prepare('UPDATE global_progress SET outfits_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(JSON.stringify(outfits));
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Guitar API server running on port ${PORT}`);
});
