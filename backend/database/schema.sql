-- ========================================================
-- AI Mock Interview Platform ("InterviewAI Prime")
-- Production MySQL 8.0 Relational Database Schema
-- ========================================================

CREATE DATABASE IF NOT EXISTS `ai_mock_interview` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ai_mock_interview`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `hashed_password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NULL,
    `role` VARCHAR(50) DEFAULT 'candidate',
    `is_active` BOOLEAN DEFAULT TRUE,
    `is_verified` BOOLEAN DEFAULT FALSE,
    `otp_code` VARCHAR(10) NULL,
    `otp_expires_at` DATETIME NULL,
    `reset_token` VARCHAR(255) NULL,
    `reset_token_expires_at` DATETIME NULL,
    `onboarding_completed` BOOLEAN DEFAULT FALSE,
    `onboarding_completed_at` DATETIME NULL,
    `onboarding_step` INT DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_user_email` (`email`),
    INDEX `idx_user_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS `profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `target_role` VARCHAR(100) DEFAULT 'Software Engineer',
    `experience_level` VARCHAR(50) DEFAULT 'Mid-Level',
    `interview_date` DATETIME NULL,
    `interview_date_preset` VARCHAR(50) NULL,
    `target_company` VARCHAR(100) NULL,
    `resume_url` VARCHAR(255) NULL,
    `onboarding_completed` BOOLEAN DEFAULT FALSE,
    `bio` TEXT NULL,
    `avatar_url` VARCHAR(255) NULL,
    `readiness_score` FLOAT DEFAULT 82.5,
    `total_interviews` INT DEFAULT 0,
    `streak_days` INT DEFAULT 4,
    `xp_points` INT DEFAULT 480,
    `freeze_used_this_week` BOOLEAN DEFAULT FALSE,
    `last_freeze_used_at` DATETIME NULL,
    `last_freeze_reset_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `monthly_quota` INT DEFAULT 10,
    `sessions_used_this_month` INT DEFAULT 0,
    `last_quota_reset_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `theme_preference` VARCHAR(20) DEFAULT 'dark',
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Interviews Table
CREATE TABLE IF NOT EXISTS `interviews` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `role` VARCHAR(100) NOT NULL,
    `company` VARCHAR(100) DEFAULT 'General Tech',
    `difficulty` VARCHAR(50) DEFAULT 'Medium',
    `interview_type` VARCHAR(50) DEFAULT 'Technical & System Design',
    `question_count` INT DEFAULT 5,
    `overall_score` FLOAT DEFAULT 0.0,
    `technical_score` FLOAT DEFAULT 0.0,
    `behavioral_score` FLOAT DEFAULT 0.0,
    `communication_score` FLOAT DEFAULT 0.0,
    `confidence_score` FLOAT DEFAULT 0.0,
    `hiring_recommendation` VARCHAR(50) DEFAULT 'Pending',
    `status` VARCHAR(50) DEFAULT 'in_progress',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_interview_user` (`user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Questions Table
CREATE TABLE IF NOT EXISTS `questions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `interview_id` INT NOT NULL,
    `question_order` INT NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `question_text` TEXT NOT NULL,
    `expected_keywords` JSON NULL,
    `ideal_answer` TEXT NULL,
    `code_template` TEXT NULL,
    INDEX `idx_question_interview` (`interview_id`),
    FOREIGN KEY (`interview_id`) REFERENCES `interviews`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Answers & Evaluations Table
CREATE TABLE IF NOT EXISTS `answers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `question_id` INT NOT NULL,
    `user_response` MEDIUMTEXT NOT NULL,
    `code_submission` MEDIUMTEXT NULL,
    `audio_duration_sec` FLOAT DEFAULT 0.0,
    `filler_word_count` INT DEFAULT 0,
    `words_per_minute` FLOAT DEFAULT 0.0,
    `score` FLOAT DEFAULT 0.0,
    `technical_accuracy` FLOAT DEFAULT 0.0,
    `clarity_score` FLOAT DEFAULT 0.0,
    `star_method_score` FLOAT DEFAULT 0.0,
    `strengths` JSON NULL,
    `improvements` JSON NULL,
    `model_answer` MEDIUMTEXT NULL,
    `adaptive_followup_question` TEXT NULL,
    INDEX `idx_answer_question` (`question_id`),
    FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Resumes Table
CREATE TABLE IF NOT EXISTS `resumes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `extracted_skills` JSON NULL,
    `missing_skills` JSON NULL,
    `resume_score` FLOAT DEFAULT 80.0,
    `summary` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Study Plan Tasks Table
CREATE TABLE IF NOT EXISTS `study_plans` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `week_number` INT NOT NULL,
    `day_number` INT DEFAULT 1,
    `title` VARCHAR(255) NOT NULL,
    `session_type` VARCHAR(50) NOT NULL,
    `sessions_count` INT DEFAULT 1,
    `status` VARCHAR(50) DEFAULT 'pending',
    `completed_at` DATETIME NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_plan_user` (`user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Career Roadmaps Table
CREATE TABLE IF NOT EXISTS `career_roadmaps` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `target_role` VARCHAR(100) NOT NULL,
    `overall_progress` FLOAT DEFAULT 0.0,
    `milestones` JSON NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Readiness Snapshots Table
CREATE TABLE IF NOT EXISTS `readiness_snapshots` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `week_start_date` DATETIME NOT NULL,
    `readiness_score` FLOAT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
