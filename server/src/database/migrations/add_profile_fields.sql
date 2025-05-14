-- Add profile fields to users table
-- Using individual ALTER statements to avoid errors if columns already exist

-- Add student_id column if it doesn't exist
SELECT COUNT(*) INTO @student_id_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'users' 
AND column_name = 'student_id';

SET @alter_student_id = IF(@student_id_exists = 0, 
                         'ALTER TABLE users ADD COLUMN student_id VARCHAR(50) NULL',
                         'SELECT 1');
PREPARE stmt FROM @alter_student_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add department column if it doesn't exist
SELECT COUNT(*) INTO @department_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'users' 
AND column_name = 'department';

SET @alter_department = IF(@department_exists = 0, 
                          'ALTER TABLE users ADD COLUMN department VARCHAR(100) NULL',
                          'SELECT 1');
PREPARE stmt FROM @alter_department;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add position column if it doesn't exist
SELECT COUNT(*) INTO @position_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'users' 
AND column_name = 'position';

SET @alter_position = IF(@position_exists = 0, 
                        'ALTER TABLE users ADD COLUMN position VARCHAR(100) NULL',
                        'SELECT 1');
PREPARE stmt FROM @alter_position;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add phone_number column if it doesn't exist
SELECT COUNT(*) INTO @phone_number_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'users' 
AND column_name = 'phone_number';

SET @alter_phone = IF(@phone_number_exists = 0, 
                     'ALTER TABLE users ADD COLUMN phone_number VARCHAR(50) NULL',
                     'SELECT 1');
PREPARE stmt FROM @alter_phone;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add profile_image column if it doesn't exist
SELECT COUNT(*) INTO @profile_image_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'users' 
AND column_name = 'profile_image';

SET @alter_profile = IF(@profile_image_exists = 0, 
                       'ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) NULL',
                       'SELECT 1');
PREPARE stmt FROM @alter_profile;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create index on student_id if it doesn't exist
SELECT COUNT(*) INTO @index_exists 
FROM information_schema.statistics 
WHERE table_schema = DATABASE() 
AND table_name = 'users' 
AND index_name = 'idx_student_id';

SET @create_index = IF(@index_exists = 0, 
                      'CREATE INDEX idx_student_id ON users(student_id)',
                      'SELECT 1');
PREPARE stmt FROM @create_index;
EXECUTE stmt;
DEALLOCATE PREPARE stmt; 